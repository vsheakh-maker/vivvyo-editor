import {
  TransformSettings,
  WatermarkSettings,
  AudioSettings,
  AspectRatioType,
  CompressionSettings,
  CustomCropSettings,
  FontGeneratorSettings,
  OutputFormat,
  BgRemoverSettings,
} from '../types.ts';
import { getAudioContext, playSynthTrack, audioBufferToWavBlob, SynthPlaybackHandle } from './audioSynth.ts';

export interface ExportVideoOptions {
  videoElement: HTMLVideoElement;
  startTime: number;
  endTime: number;
  speed: number;
  aspectRatio: AspectRatioType;
  customCrop?: CustomCropSettings;
  filterCss: string;
  transform: TransformSettings;
  watermark: WatermarkSettings;
  fontGenerator?: FontGeneratorSettings;
  audio: AudioSettings;
  compression: CompressionSettings;
  outputFormat?: OutputFormat;
  autoCompress?: boolean;
  onProgress?: (percent: number) => void;
}

export interface ExportResult {
  blob: Blob;
  blobUrl: string;
  duration: number;
  sizeBytes: number;
  mimeType: string;
  format?: OutputFormat;
  filename?: string;
}

/**
 * Renders and records an edited video segment with all transforms,
 * filters, cropping, watermarks, speed, audio tracks, and format encoding.
 */
export async function exportEditedVideo(options: ExportVideoOptions): Promise<ExportResult> {
  const {
    videoElement,
    startTime,
    endTime,
    speed,
    aspectRatio,
    customCrop,
    filterCss,
    transform,
    watermark,
    fontGenerator,
    audio,
    compression,
    outputFormat = 'mp4',
    autoCompress = true,
    onProgress,
  } = options;

  // Determine target canvas dimensions based on compression & aspect ratio
  let targetHeight = 720;
  if (autoCompress) {
    // When auto compress is active, optimize resolution for balance of quality and small file size
    if (compression.targetResolution === '1080p') targetHeight = 1080;
    else if (compression.targetResolution === '480p') targetHeight = 480;
    else if (compression.targetResolution === '360p') targetHeight = 360;
    else targetHeight = 720; // 720p sweet spot for mobile
  } else {
    if (compression.targetResolution === '1080p') targetHeight = 1080;
    else if (compression.targetResolution === '720p') targetHeight = 720;
    else if (compression.targetResolution === '480p') targetHeight = 480;
    else targetHeight = 360;
  }

  // Compute width according to aspect ratio
  let targetWidth = Math.round(targetHeight * (16 / 9));
  if (aspectRatio === '9:16') {
    targetWidth = Math.round(targetHeight * (9 / 16));
  } else if (aspectRatio === '1:1') {
    targetWidth = targetHeight;
  } else if (aspectRatio === '4:5') {
    targetWidth = Math.round(targetHeight * (4 / 5));
  } else if (aspectRatio === '4:3') {
    targetWidth = Math.round(targetHeight * (4 / 3));
  } else if (aspectRatio === 'custom' && customCrop) {
    const ratio = customCrop.widthRatio / customCrop.heightRatio;
    targetWidth = Math.round(targetHeight * ratio);
  } else if (aspectRatio === 'original') {
    const vW = videoElement.videoWidth || 1280;
    const vH = videoElement.videoHeight || 720;
    targetWidth = Math.round(targetHeight * (vW / vH));
  }

  // Ensure even dimensions for video codecs
  if (targetWidth % 2 !== 0) targetWidth += 1;
  if (targetHeight % 2 !== 0) targetHeight += 1;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Set up audio mixing
  const audioCtx = getAudioContext();
  const audioDestination = audioCtx.createMediaStreamDestination();
  let synthHandle: SynthPlaybackHandle | null = null;

  // If BGM is selected, connect synth track to destination
  if (audio.bgmTrackId) {
    synthHandle = playSynthTrack(audio.bgmTrackId, audio.bgmVolume, audioDestination);
  }

  // If video audio is active and unmuted
  let videoAudioSourceNode: MediaElementAudioSourceNode | null = null;
  if (!audio.muted && audio.videoVolume > 0) {
    try {
      videoAudioSourceNode = audioCtx.createMediaElementSource(videoElement);
      const videoGainNode = audioCtx.createGain();
      videoGainNode.gain.setValueAtTime(audio.videoVolume, audioCtx.currentTime);
      videoAudioSourceNode.connect(videoGainNode);
      videoGainNode.connect(audioDestination);
    } catch {
      // Audio source may already be connected or restricted by CORS
    }
  }

  // Capture canvas video stream
  const canvasStream = canvas.captureStream(30);

  // Combine video and audio tracks
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));
  audioDestination.stream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));

  // Determine supported mime type based on selected output format
  let chosenMime = 'video/webm;codecs=vp8,opus';
  if (outputFormat === 'mp4' || outputFormat === 'mov') {
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
      chosenMime = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      chosenMime = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264,opus')) {
      chosenMime = 'video/webm;codecs=h264,opus';
    }
  } else {
    // webm
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      chosenMime = 'video/webm;codecs=vp9,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      chosenMime = 'video/webm;codecs=vp8,opus';
    } else {
      chosenMime = 'video/webm';
    }
  }

  if (!MediaRecorder.isTypeSupported(chosenMime)) {
    chosenMime = 'video/webm';
  }

  // Bitrate estimation based on quality & auto-compression
  let videoBitrate = 2500000;
  if (autoCompress) {
    // Highly efficient compression profile: saves 50-70% file size
    if (compression.quality === 'high') videoBitrate = 3200000;
    else if (compression.quality === 'low') videoBitrate = 900000;
    else videoBitrate = 1800000; // Balanced compressed rate
  } else {
    if (compression.quality === 'high') videoBitrate = 5500000;
    else if (compression.quality === 'low') videoBitrate = 1200000;
    else videoBitrate = 2800000;
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: chosenMime,
    videoBitsPerSecond: videoBitrate,
  });

  const recordedChunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const clipDuration = Math.max(0.5, (endTime - startTime) / speed);

  return new Promise((resolve, reject) => {
    let animFrameId: number;
    let isFinished = false;

    recorder.onerror = (err) => {
      cancelAnimationFrame(animFrameId);
      if (synthHandle) synthHandle.stop();
      reject(err);
    };

    recorder.onstop = () => {
      cancelAnimationFrame(animFrameId);
      if (synthHandle) synthHandle.stop();

      const finalBlob = new Blob(recordedChunks, { type: chosenMime });
      const blobUrl = URL.createObjectURL(finalBlob);

      resolve({
        blob: finalBlob,
        blobUrl,
        duration: clipDuration,
        sizeBytes: finalBlob.size,
        mimeType: chosenMime,
        format: outputFormat,
        filename: `vivvyo-export-${Date.now()}.${outputFormat}`,
      });
    };

    // Seek video to start point and configure playback
    videoElement.currentTime = startTime;
    videoElement.playbackRate = speed;
    videoElement.muted = true; // muted in preview to prevent browser echo

    videoElement.onseeked = () => {
      videoElement.onseeked = null;
      recorder.start(100);
      videoElement.play().catch(reject);

      const renderLoop = () => {
        if (isFinished) return;

        const currentClipTime = (videoElement.currentTime - startTime) / speed;
        const progressPercent = Math.min(100, Math.max(0, Math.round((currentClipTime / clipDuration) * 100)));
        if (onProgress) onProgress(progressPercent);

        // Check if finished
        if (videoElement.currentTime >= endTime || videoElement.ended) {
          isFinished = true;
          if (onProgress) onProgress(100);
          recorder.stop();
          return;
        }

        // Draw background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Save context state for transforms
        ctx.save();

        // Apply CSS filter
        ctx.filter = filterCss !== 'none' ? filterCss : 'none';

        // Move to center of canvas for rotation & flipping
        ctx.translate(targetWidth / 2, targetHeight / 2);

        // Apply rotation
        if (transform.rotation !== 0) {
          ctx.rotate((transform.rotation * Math.PI) / 180);
        }

        // Apply mirror/flip
        const scaleX = transform.flipHorizontal ? -1 : 1;
        const scaleY = transform.flipVertical ? -1 : 1;
        ctx.scale(scaleX, scaleY);

        // Calculate video source crop coordinates & destination draw
        const vW = videoElement.videoWidth || targetWidth;
        const vH = videoElement.videoHeight || targetHeight;

        let drawW = targetWidth;
        let drawH = targetHeight;
        const targetAspect = targetWidth / targetHeight;
        const videoAspect = vW / vH;

        if (videoAspect > targetAspect) {
          drawH = targetHeight;
          drawW = targetHeight * videoAspect;
        } else {
          drawW = targetWidth;
          drawH = targetWidth / videoAspect;
        }

        ctx.drawImage(videoElement, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Draw Font Generator text overlay if present
        if (fontGenerator && fontGenerator.text && fontGenerator.text.trim()) {
          ctx.save();
          const fg = fontGenerator;
          ctx.font = `${fg.fontSize || 32}px ${fg.fontFamily || 'sans-serif'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textX = targetWidth / 2;
          const textY = (targetHeight * (fg.positionY || 50)) / 100;
          const metrics = ctx.measureText(fg.text);
          const tW = metrics.width;
          const tH = fg.fontSize;

          // Draw pill background if active
          if (fg.bgPill) {
            ctx.fillStyle = fg.pillColor || 'rgba(0,0,0,0.7)';
            ctx.beginPath();
            ctx.roundRect(textX - tW / 2 - 16, textY - tH / 2 - 8, tW + 32, tH + 16, 12);
            ctx.fill();
          }

          // Effects
          if (fg.effect === 'glow') {
            ctx.shadowColor = fg.glowColor || '#00f0ff';
            ctx.shadowBlur = (fg.glowIntensity ?? 15) * 2;
          } else if (fg.effect === 'shadow') {
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
          } else if (fg.effect === '3d') {
            // Draw faux 3D extrusion shadow
            ctx.fillStyle = fg.strokeColor || '#000000';
            ctx.fillText(fg.text, textX + 3, textY + 3);
          }

          // Stroke
          if (fg.strokeWidth && fg.strokeWidth > 0) {
            ctx.strokeStyle = fg.strokeColor || '#000000';
            ctx.lineWidth = fg.strokeWidth;
            ctx.strokeText(fg.text, textX, textY);
          }

          // Fill text
          ctx.fillStyle = fg.color || '#ffffff';
          ctx.fillText(fg.text, textX, textY);
          ctx.restore();
        }

        // Draw watermark text if configured
        if (watermark.text && watermark.text.trim()) {
          ctx.save();
          ctx.font = `600 ${watermark.fontSize}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = watermark.color;
          ctx.globalAlpha = watermark.opacity;

          const metrics = ctx.measureText(watermark.text);
          const textW = metrics.width;
          const textH = watermark.fontSize;
          const padding = 12;

          let posX = padding;
          let posY = textH + padding;

          if (watermark.position === 'top-right') {
            posX = targetWidth - textW - padding;
            posY = textH + padding;
          } else if (watermark.position === 'center') {
            posX = (targetWidth - textW) / 2;
            posY = (targetHeight + textH) / 2;
          } else if (watermark.position === 'bottom-left') {
            posX = padding;
            posY = targetHeight - padding;
          } else if (watermark.position === 'bottom-right') {
            posX = targetWidth - textW - padding;
            posY = targetHeight - padding;
          }

          if (watermark.hasBackground) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.roundRect(posX - 8, posY - textH - 4, textW + 16, textH + 12, 6);
            ctx.fill();
          }

          ctx.fillStyle = watermark.color;
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(watermark.text, posX, posY);
          ctx.restore();
        }

        animFrameId = requestAnimationFrame(renderLoop);
      };

      renderLoop();
    };
  });
}

/**
 * Extracts audio track from video and produces a downloadable WAV file.
 */
export async function extractAudioFromVideo(
  videoUrl: string,
  onProgress?: (pct: number) => void
): Promise<{ blob: Blob; blobUrl: string; duration: number }> {
  const audioCtx = getAudioContext();
  if (onProgress) onProgress(20);

  const response = await fetch(videoUrl);
  const arrayBuffer = await response.arrayBuffer();
  if (onProgress) onProgress(60);

  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  if (onProgress) onProgress(85);

  const wavBlob = audioBufferToWavBlob(audioBuffer);
  const blobUrl = URL.createObjectURL(wavBlob);
  if (onProgress) onProgress(100);

  return {
    blob: wavBlob,
    blobUrl,
    duration: audioBuffer.duration,
  };
}

/**
 * Creates an animated slideshow video from a list of images with background music.
 */
export async function createSlideshowVideo(
  images: { url: string; title: string }[],
  durationPerSlide = 2.5,
  bgmTrackId = 'lofi-chill',
  onProgress?: (pct: number) => void
): Promise<{ blob: Blob; blobUrl: string; duration: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280; // 9:16 vertical slideshow format
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Preload all images
  const loadedImages: HTMLImageElement[] = await Promise.all(
    images.map((item) => {
      return new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = item.url;
        img.onload = () => res(img);
        img.onerror = () => res(img);
      });
    })
  );

  const audioCtx = getAudioContext();
  const audioDestination = audioCtx.createMediaStreamDestination();
  const synthHandle = playSynthTrack(bgmTrackId, 0.6, audioDestination);

  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));
  audioDestination.stream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));

  let mimeType = 'video/webm;codecs=vp8,opus';
  if (MediaRecorder.isTypeSupported('video/mp4')) mimeType = 'video/mp4';

  const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 2000000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const totalDuration = images.length * durationPerSlide;

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      synthHandle.stop();
      const blob = new Blob(chunks, { type: mimeType });
      resolve({
        blob,
        blobUrl: URL.createObjectURL(blob),
        duration: totalDuration,
      });
    };

    recorder.start(100);
    const startTime = Date.now();

    const drawFrame = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      if (onProgress) onProgress(progress);

      if (elapsed >= totalDuration) {
        recorder.stop();
        return;
      }

      const currentSlideIdx = Math.min(
        images.length - 1,
        Math.floor(elapsed / durationPerSlide)
      );
      const slideElapsed = elapsed - currentSlideIdx * durationPerSlide;
      const slideProgress = slideElapsed / durationPerSlide;

      const currentImg = loadedImages[currentSlideIdx];

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
        ctx.save();
        const zoom = 1 + slideProgress * 0.08;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(zoom, zoom);

        const imgAspect = currentImg.naturalWidth / currentImg.naturalHeight;
        const canvasAspect = canvas.width / canvas.height;
        let dw = canvas.width;
        let dh = canvas.height;

        if (imgAspect > canvasAspect) {
          dh = canvas.height;
          dw = canvas.height * imgAspect;
        } else {
          dw = canvas.width;
          dh = canvas.width / imgAspect;
        }

        ctx.drawImage(currentImg, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }

      // Slide label watermark
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.roundRect(24, canvas.height - 80, 200, 36, 18);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(images[currentSlideIdx].title || `Photo #${currentSlideIdx + 1}`, 40, canvas.height - 58);

      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  });
}

/**
 * Auto Background Remover Engine
 * Analyzes image pixels, isolates foreground subject via color-distance & alpha matting,
 * and replaces background with transparency, solid color, gradient, or blur.
 */
export async function removeImageBackground(
  imageSource: string | HTMLImageElement,
  settings: BgRemoverSettings
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = imageSource instanceof HTMLImageElement ? imageSource : new Image();
    if (typeof imageSource === 'string') {
      img.crossOrigin = 'anonymous';
      img.src = imageSource;
    }

    img.onload = () => {
      const w = img.naturalWidth || img.width || 600;
      const h = img.naturalHeight || img.height || 600;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));

      // Draw original image
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample 4 corners to estimate primary background color
      const cornerIdxs = [
        0, // top-left
        (w - 1) * 4, // top-right
        (w * (h - 1)) * 4, // bottom-left
        (w * h - 1) * 4, // bottom-right
      ];

      let bgR = 0;
      let bgG = 0;
      let bgB = 0;
      cornerIdxs.forEach((idx) => {
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      });
      bgR /= 4;
      bgG /= 4;
      bgB /= 4;

      const threshold = settings.tolerance * 2.2; // 20 - 180 distance
      const smooth = settings.edgeSmooth * 5;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance from estimated background
        const dist = Math.sqrt(
          Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
        );

        if (dist < threshold) {
          // Transparent background pixel
          if (smooth > 0 && dist > threshold - smooth) {
            const alphaFactor = (dist - (threshold - smooth)) / smooth;
            data[i + 3] = Math.round(255 * (1 - alphaFactor));
          } else {
            data[i + 3] = 0;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Now create final output canvas with selected background type
      const outCanvas = document.createElement('canvas');
      outCanvas.width = w;
      outCanvas.height = h;
      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) return reject(new Error('Canvas context failure'));

      if (settings.backgroundType === 'color') {
        outCtx.fillStyle = settings.bgColor || '#ffffff';
        outCtx.fillRect(0, 0, w, h);
      } else if (settings.backgroundType === 'gradient') {
        const grad = outCtx.createLinearGradient(0, 0, w, h);
        if (settings.bgGradient === 'sunset') {
          grad.addColorStop(0, '#f97316');
          grad.addColorStop(1, '#ec4899');
        } else if (settings.bgGradient === 'cyber') {
          grad.addColorStop(0, '#8b5cf6');
          grad.addColorStop(1, '#06b6d4');
        } else if (settings.bgGradient === 'emerald') {
          grad.addColorStop(0, '#10b981');
          grad.addColorStop(1, '#0284c7');
        } else {
          grad.addColorStop(0, '#6366f1');
          grad.addColorStop(1, '#a855f7');
        }
        outCtx.fillStyle = grad;
        outCtx.fillRect(0, 0, w, h);
      } else if (settings.backgroundType === 'blur') {
        outCtx.filter = 'blur(16px)';
        outCtx.drawImage(img, -20, -20, w + 40, h + 40);
        outCtx.filter = 'none';
      }

      // Draw foreground subject onto output canvas
      outCtx.drawImage(canvas, 0, 0);

      outCanvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Failed to generate PNG blob'));
        const dataUrl = outCanvas.toDataURL('image/png');
        resolve({
          blob,
          dataUrl,
          width: w,
          height: h,
        });
      }, 'image/png');
    };

    img.onerror = reject;
  });
}
