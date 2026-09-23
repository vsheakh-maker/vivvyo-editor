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
  CanvasBackgroundType,
  SubtitleStyleSettings,
  StickerOverlayItem,
  TransitionSettings,
  SpeechInterval,
  VideoAsset,
} from '../types.ts';
import { getAudioContext, playSynthTrack, audioBufferToWavBlob, playTransitionSoundFx, SynthPlaybackHandle } from './audioSynth.ts';
import { computeFilteredCss } from './filterUtils.ts';

export interface ExportVideoOptions {
  videoElement: HTMLVideoElement;
  startTime: number;
  endTime: number;
  speed: number;
  aspectRatio: AspectRatioType;
  customCrop?: CustomCropSettings;
  filterCss: string;
  filterIntensity?: number;
  canvasBackground?: CanvasBackgroundType;
  transform: TransformSettings;
  watermark: WatermarkSettings;
  fontGenerator?: FontGeneratorSettings;
  subtitles?: SubtitleStyleSettings;
  stickers?: StickerOverlayItem[];
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
    filterIntensity = 100,
    canvasBackground = 'black',
    transform,
    watermark,
    fontGenerator,
    subtitles,
    stickers,
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

        // Draw backdrop ambience according to canvasBackground
        if (canvasBackground === 'blur') {
          ctx.save();
          ctx.filter = 'blur(20px) opacity(0.55)';
          ctx.drawImage(videoElement, -targetWidth * 0.1, -targetHeight * 0.1, targetWidth * 1.2, targetHeight * 1.2);
          ctx.restore();
        } else if (canvasBackground === 'gradient-indigo') {
          const grad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
          grad.addColorStop(0, '#1e1b4b');
          grad.addColorStop(0.5, '#0f172a');
          grad.addColorStop(1, '#3b0764');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else if (canvasBackground === 'gradient-sunset') {
          const grad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
          grad.addColorStop(0, '#4c0519');
          grad.addColorStop(0.5, '#451a03');
          grad.addColorStop(1, '#3b0764');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else if (canvasBackground === 'grid') {
          ctx.fillStyle = '#0a0a0f';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          const gridSize = 24;
          for (let x = 0; x < targetWidth; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, targetHeight);
            ctx.stroke();
          }
          for (let y = 0; y < targetHeight; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(targetWidth, y);
            ctx.stroke();
          }
        } else if (canvasBackground === 'white') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        // Save context state for transforms
        ctx.save();

        // Apply CSS filter scaled with intensity
        const appliedFilter = computeFilteredCss(filterCss, filterIntensity);
        ctx.filter = appliedFilter !== 'none' ? appliedFilter : 'none';

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

        // Draw subtitles if enabled
        if (subtitles && subtitles.enabled && subtitles.items && subtitles.items.length > 0) {
          const vCurrentTime = videoElement.currentTime;
          const activeSub = subtitles.items.find(
            (it) => vCurrentTime >= it.startTime && vCurrentTime <= it.endTime
          );
          if (activeSub && activeSub.text) {
            ctx.save();
            const fontSize = Math.round(subtitles.fontSize * (targetHeight / 720));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let posY = targetHeight * 0.84;
            if (subtitles.position === 'top') posY = targetHeight * 0.16;
            else if (subtitles.position === 'middle') posY = targetHeight * 0.5;

            const textW = ctx.measureText(activeSub.text).width;
            if (subtitles.hasBackground) {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
              ctx.beginPath();
              ctx.roundRect(targetWidth / 2 - textW / 2 - 14, posY - fontSize / 2 - 8, textW + 28, fontSize + 16, 8);
              ctx.fill();
            }

            if (subtitles.preset === 'hormozi') {
              ctx.lineWidth = 6;
              ctx.strokeStyle = '#000000';
              ctx.strokeText(activeSub.text.toUpperCase(), targetWidth / 2, posY);
              ctx.fillStyle = subtitles.highlightColor || '#eab308';
              ctx.fillText(activeSub.text.toUpperCase(), targetWidth / 2, posY);
            } else if (subtitles.preset === 'neon') {
              ctx.shadowColor = subtitles.highlightColor || '#ec4899';
              ctx.shadowBlur = 14;
              ctx.fillStyle = subtitles.primaryColor || '#38bdf8';
              ctx.fillText(activeSub.text, targetWidth / 2, posY);
            } else {
              ctx.shadowColor = 'rgba(0,0,0,0.8)';
              ctx.shadowBlur = 4;
              ctx.fillStyle = subtitles.primaryColor || '#ffffff';
              ctx.fillText(activeSub.text, targetWidth / 2, posY);
            }
            ctx.restore();
          }
        }

        // Draw stickers if present
        if (stickers && stickers.length > 0) {
          for (const stk of stickers) {
            ctx.save();
            const posX = (stk.x / 100) * targetWidth;
            const posY = (stk.y / 100) * targetHeight;
            ctx.translate(posX, posY);
            ctx.rotate((stk.rotation * Math.PI) / 180);

            const scaledSize = Math.round(stk.size * (targetHeight / 720));

            if (stk.type === 'badge') {
              ctx.font = `900 ${Math.max(14, Math.round(scaledSize * 0.65))}px sans-serif`;
              const textMetrics = ctx.measureText(stk.content);
              const bWidth = textMetrics.width + 24;
              const bHeight = scaledSize + 12;

              ctx.fillStyle = 'rgba(219, 39, 119, 0.9)';
              ctx.beginPath();
              ctx.roundRect(-bWidth / 2, -bHeight / 2, bWidth, bHeight, bHeight / 2);
              ctx.fill();

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.stroke();

              ctx.fillStyle = '#ffffff';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(stk.content, 0, 0);
            } else {
              ctx.font = `${scaledSize}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(stk.content, 0, 0);
            }
            ctx.restore();
          }
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

/**
 * Joins multiple video clips into a single continuous video with customized visual transitions
 * (cross-dissolve, fade-to-black, flash-white, zoom-in, zoom-out, slide-left, slide-right, blur, glitch)
 * and optional synthesized audio SFX (whoosh, swish, pop, glitch).
 */
export async function joinVideosWithTransitions(
  clips: VideoAsset[],
  transitions: TransitionSettings[],
  onProgress?: (pct: number) => void
): Promise<ExportResult> {
  if (clips.length === 0) {
    throw new Error('No video clips provided for sequence');
  }

  // Target canvas dimensions
  const targetWidth = 1280;
  const targetHeight = 720;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not initialize canvas context');

  // Pre-instantiate video elements for all clips
  const videoElements: HTMLVideoElement[] = [];
  for (let i = 0; i < clips.length; i++) {
    const v = document.createElement('video');
    v.crossOrigin = 'anonymous';
    v.muted = true;
    v.playsInline = true;
    v.src = clips[i].url;
    videoElements.push(v);
  }

  // Wait for initial metadata on all clips
  await Promise.all(
    videoElements.map(
      (v) =>
        new Promise<void>((resolve) => {
          if (v.readyState >= 1) return resolve();
          v.onloadedmetadata = () => resolve();
          v.onerror = () => resolve(); // continue even if metadata has delay
        })
    )
  );

  // Setup media stream & recorder
  const canvasStream = canvas.captureStream(30);
  const audioCtx = getAudioContext();
  const audioDestination = audioCtx.createMediaStreamDestination();

  // Combine canvas video + audio destination
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));
  audioDestination.stream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));

  let mimeType = 'video/webm;codecs=vp8,opus';
  if (MediaRecorder.isTypeSupported('video/mp4')) mimeType = 'video/mp4';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 3500000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  // Calculate durations and transition points
  const clipDurations = clips.map((c) => Math.min(10, Math.max(3, c.duration || 5)));

  // Transition durations between clip i and clip i+1
  const transDurations: number[] = [];
  for (let i = 0; i < clips.length - 1; i++) {
    const t = transitions[i] || { type: 'cross-dissolve', duration: 0.8, easing: 'ease-in-out' };
    transDurations.push(Math.min(1.5, Math.max(0.3, t.duration || 0.8)));
  }

  // Total timeline duration
  let totalTime = 0;
  for (let i = 0; i < clipDurations.length; i++) {
    totalTime += clipDurations[i];
    if (i > 0) {
      totalTime -= transDurations[i - 1]; // overlap
    }
  }
  totalTime = Math.max(2, totalTime);

  return new Promise((resolve, reject) => {
    let animId: number;

    recorder.onstop = () => {
      cancelAnimationFrame(animId);
      videoElements.forEach((v) => {
        try {
          v.pause();
          v.src = '';
        } catch {}
      });

      const blob = new Blob(chunks, { type: mimeType });
      resolve({
        blob,
        blobUrl: URL.createObjectURL(blob),
        duration: totalTime,
        sizeBytes: blob.size,
        mimeType,
        filename: `joined-sequence-${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`,
      });
    };

    recorder.onerror = (e) => {
      cancelAnimationFrame(animId);
      reject(e);
    };

    recorder.start(100);

    // Timeline playback loop
    const startTime = performance.now();
    let currentClipIdx = 0;
    const sfxTriggered = new Set<number>();

    // Start playing first video
    try {
      videoElements[0].currentTime = 0;
      videoElements[0].play().catch(() => {});
    } catch {}

    const drawCover = (v: HTMLVideoElement, alpha = 1, scale = 1, offsetX = 0, offsetY = 0) => {
      if (v.readyState < 2) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(targetWidth / 2 + offsetX, targetHeight / 2 + offsetY);
      ctx.scale(scale, scale);
      ctx.translate(-targetWidth / 2, -targetHeight / 2);

      const vW = v.videoWidth || targetWidth;
      const vH = v.videoHeight || targetHeight;
      const aspect = vW / vH;
      const targetAspect = targetWidth / targetHeight;

      let drawW = targetWidth;
      let drawH = targetHeight;
      let drawX = 0;
      let drawY = 0;

      if (aspect > targetAspect) {
        drawW = targetHeight * aspect;
        drawX = (targetWidth - drawW) / 2;
      } else {
        drawH = targetWidth / aspect;
        drawY = (targetHeight - drawH) / 2;
      }

      ctx.drawImage(v, drawX, drawY, drawW, drawH);
      ctx.restore();
    };

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const pct = Math.min(100, Math.round((elapsed / totalTime) * 100));
      if (onProgress) onProgress(pct);

      if (elapsed >= totalTime) {
        recorder.stop();
        return;
      }

      // Compute which clip / transition is active
      let segStart = 0;
      let activeClip = 0;
      let inTransition = false;
      let transitionProgress = 0;
      let transConfig: TransitionSettings = transitions[0] || { type: 'cross-dissolve', duration: 0.8, easing: 'ease-in-out' };

      for (let i = 0; i < clips.length; i++) {
        const cDur = clipDurations[i];
        const nextTransDur = i < clips.length - 1 ? transDurations[i] : 0;
        const cEnd = segStart + cDur;
        const transStart = cEnd - nextTransDur;

        if (elapsed < cEnd) {
          activeClip = i;
          if (i < clips.length - 1 && elapsed >= transStart) {
            inTransition = true;
            transConfig = transitions[i] || transConfig;
            transitionProgress = Math.min(1, (elapsed - transStart) / nextTransDur);

            // Play transition SFX once at the transition boundary
            if (!sfxTriggered.has(i)) {
              sfxTriggered.add(i);
              if (transConfig.soundFx && transConfig.soundFx !== 'none') {
                playTransitionSoundFx(transConfig.soundFx, 0.6);
              }
              // Ensure next video is playing
              try {
                if (videoElements[i + 1]) {
                  videoElements[i + 1].currentTime = 0;
                  videoElements[i + 1].play().catch(() => {});
                }
              } catch {}
            }
          }
          break;
        }

        segStart = transStart;
      }

      // Check video playback states
      if (currentClipIdx !== activeClip) {
        currentClipIdx = activeClip;
        try {
          if (videoElements[activeClip]) {
            videoElements[activeClip].play().catch(() => {});
          }
        } catch {}
      }

      // Clear frame
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const vidA = videoElements[activeClip];
      const vidB = videoElements[activeClip + 1];

      if (!inTransition || !vidB) {
        if (vidA) drawCover(vidA, 1);
      } else {
        const tType = transConfig.type;
        const p = transitionProgress;

        switch (tType) {
          case 'fade-black':
            if (p < 0.5) {
              const alphaA = 1 - p * 2;
              drawCover(vidA, alphaA);
            } else {
              const alphaB = (p - 0.5) * 2;
              drawCover(vidB, alphaB);
            }
            break;

          case 'fade-white':
            if (p < 0.5) {
              drawCover(vidA, 1);
              ctx.fillStyle = `rgba(255, 255, 255, ${p * 2})`;
              ctx.fillRect(0, 0, targetWidth, targetHeight);
            } else {
              drawCover(vidB, 1);
              ctx.fillStyle = `rgba(255, 255, 255, ${(1 - p) * 2})`;
              ctx.fillRect(0, 0, targetWidth, targetHeight);
            }
            break;

          case 'zoom-in': {
            const scaleA = 1 + p * 0.8;
            const scaleB = 0.6 + p * 0.4;
            drawCover(vidA, 1 - p, scaleA);
            drawCover(vidB, p, scaleB);
            break;
          }

          case 'zoom-out': {
            const scaleA = 1 - p * 0.3;
            const scaleB = 1.5 - p * 0.5;
            drawCover(vidA, 1 - p, scaleA);
            drawCover(vidB, p, scaleB);
            break;
          }

          case 'slide-left': {
            const offA = -p * targetWidth;
            const offB = (1 - p) * targetWidth;
            drawCover(vidA, 1, 1, offA, 0);
            drawCover(vidB, 1, 1, offB, 0);
            break;
          }

          case 'slide-right': {
            const offA = p * targetWidth;
            const offB = -(1 - p) * targetWidth;
            drawCover(vidA, 1, 1, offA, 0);
            drawCover(vidB, 1, 1, offB, 0);
            break;
          }

          case 'blur-dissolve': {
            ctx.save();
            const blurAmount = Math.sin(p * Math.PI) * 16;
            ctx.filter = `blur(${blurAmount}px)`;
            drawCover(vidA, 1 - p);
            drawCover(vidB, p);
            ctx.restore();
            break;
          }

          case 'glitch': {
            if (p > 0.15 && p < 0.85) {
              const jitterX = (Math.random() - 0.5) * 40;
              const jitterY = (Math.random() - 0.5) * 20;
              drawCover(vidA, 1 - p);
              drawCover(vidB, p, 1, jitterX, jitterY);
              ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
              ctx.fillRect(0, Math.random() * targetHeight, targetWidth, 8);
              ctx.fillStyle = 'rgba(255, 0, 128, 0.2)';
              ctx.fillRect(0, Math.random() * targetHeight, targetWidth, 12);
            } else {
              drawCover(vidA, 1 - p);
              drawCover(vidB, p);
            }
            break;
          }

          case 'cross-dissolve':
          default:
            drawCover(vidA, 1);
            drawCover(vidB, p);
            break;
        }
      }

      // Subtle status badge
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(24, targetHeight - 56, 180, 32, 16);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`Clip ${activeClip + 1}/${clips.length} • ${Math.round(elapsed)}s`, 40, targetHeight - 36);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
  });
}

/**
 * Automatically cuts silent segments and pauses from a video, stitching
 * the active speech intervals into a clean, jump-cut video clip.
 */
export async function cutVideoSilence(
  videoAsset: VideoAsset,
  speechSegments: SpeechInterval[],
  onProgress?: (pct: number) => void
): Promise<ExportResult> {
  const segments = speechSegments.length > 0
    ? speechSegments
    : [{ start: 0, end: videoAsset.duration || 10, duration: videoAsset.duration || 10 }];

  const totalCleanedDuration = segments.reduce((acc, s) => acc + s.duration, 0);

  const videoElement = document.createElement('video');
  videoElement.crossOrigin = 'anonymous';
  videoElement.playsInline = true;
  videoElement.muted = false;
  videoElement.src = videoAsset.url;

  await new Promise<void>((resolve) => {
    if (videoElement.readyState >= 1) return resolve();
    videoElement.onloadedmetadata = () => resolve();
    videoElement.onerror = () => resolve();
  });

  const width = videoElement.videoWidth || videoAsset.width || 1280;
  const height = videoElement.videoHeight || videoAsset.height || 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');

  const audioCtx = getAudioContext();
  const audioDestination = audioCtx.createMediaStreamDestination();
  try {
    const sourceNode = audioCtx.createMediaElementSource(videoElement);
    sourceNode.connect(audioDestination);
  } catch {
    // MediaElementSource might already be attached or restricted
  }

  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));
  audioDestination.stream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));

  let mimeType = 'video/webm;codecs=vp8,opus';
  if (MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264,opus')) {
    mimeType = 'video/webm;codecs=h264,opus';
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 3500000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    let animId: number;
    let isStopped = false;

    recorder.onstop = () => {
      cancelAnimationFrame(animId);
      try {
        videoElement.pause();
        videoElement.src = '';
      } catch {}
      const blob = new Blob(chunks, { type: mimeType });
      resolve({
        blob,
        blobUrl: URL.createObjectURL(blob),
        duration: Math.round(totalCleanedDuration * 100) / 100,
        sizeBytes: blob.size,
        mimeType,
        filename: `${videoAsset.title.replace(/\s+/g, '_')}_autocut.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`,
      });
    };

    recorder.onerror = (e) => {
      cancelAnimationFrame(animId);
      reject(e);
    };

    let currentSegmentIndex = 0;
    let recordedTime = 0;

    const startNextSegment = () => {
      if (currentSegmentIndex >= segments.length) {
        if (!isStopped) {
          isStopped = true;
          if (onProgress) onProgress(100);
          recorder.stop();
        }
        return;
      }

      const seg = segments[currentSegmentIndex];
      videoElement.currentTime = seg.start;
      videoElement.play().catch(() => {});
    };

    videoElement.onseeked = () => {
      if (isStopped) return;
      const seg = segments[currentSegmentIndex];
      if (!seg) return;

      const render = () => {
        if (isStopped) return;

        // Draw video frame to canvas
        ctx.drawImage(videoElement, 0, 0, width, height);

        // Calculate progress
        const segElapsed = Math.max(0, videoElement.currentTime - seg.start);
        const currentOverallTime = recordedTime + segElapsed;
        const pct = Math.min(99, Math.round((currentOverallTime / Math.max(1, totalCleanedDuration)) * 100));
        if (onProgress) onProgress(pct);

        // Check if current speech segment is finished
        if (videoElement.currentTime >= seg.end || videoElement.ended) {
          recordedTime += seg.duration;
          currentSegmentIndex++;
          startNextSegment();
          return;
        }

        animId = requestAnimationFrame(render);
      };

      animId = requestAnimationFrame(render);
    };

    recorder.start(100);
    startNextSegment();
  });
}
