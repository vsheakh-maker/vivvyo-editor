package com.example.vivvyo.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.vivvyo.model.*
import com.example.vivvyo.ui.theme.*
import java.util.Locale

@Composable
fun VideoPlayerPreview(
    video: VideoAsset,
    isPlaying: Boolean,
    currentTime: Float,
    duration: Float,
    trimStart: Float,
    trimEnd: Float,
    aspectRatio: AspectRatioType,
    filterType: FilterType,
    filterIntensity: Float,
    transform: TransformSettings,
    speed: Float,
    watermark: WatermarkSettings,
    fontGenerator: FontGeneratorSettings,
    subtitles: SubtitleStyleSettings,
    stickers: List<StickerOverlayItem>,
    audioSettings: AudioSettings,
    onTogglePlay: () -> Unit,
    onSeek: (Float) -> Unit,
    onRemoveSticker: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(StudioDarkBackground)
    ) {
        // Video Stage Box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(290.dp)
                .background(Color(0xFF07070E)),
            contentAlignment = Alignment.Center
        ) {
            // Calculate Aspect Ratio Modifier
            val targetRatio = aspectRatio.ratio ?: (video.width.toFloat() / video.height.toFloat().coerceAtLeast(1f))
            
            Box(
                modifier = Modifier
                    .fillMaxHeight(0.96f)
                    .aspectRatio(targetRatio)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.Black)
                    .border(1.dp, StudioCardBorder, RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                // Video Frame Image with Transform
                val scaleX = if (transform.flipHorizontal) -1f else 1f
                val scaleY = if (transform.flipVertical) -1f else 1f

                // Color Matrix for Filter Effects
                val colorFilter = remember(filterType, filterIntensity) {
                    getColorFilterForType(filterType, filterIntensity / 100f)
                }

                AsyncImage(
                    model = video.thumbnailUrl.ifEmpty { "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
                    contentDescription = video.title,
                    contentScale = ContentScale.Crop,
                    colorFilter = colorFilter,
                    modifier = Modifier
                        .fillMaxSize()
                        .rotate(transform.rotation)
                        .scale(scaleX, scaleY)
                )

                // Watermark Layer
                if (watermark.text.isNotEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(12.dp)
                    ) {
                        val alignment = when (watermark.position) {
                            WatermarkPosition.TOP_LEFT -> Alignment.TopStart
                            WatermarkPosition.TOP_RIGHT -> Alignment.TopEnd
                            WatermarkPosition.CENTER -> Alignment.Center
                            WatermarkPosition.BOTTOM_LEFT -> Alignment.BottomStart
                            WatermarkPosition.BOTTOM_RIGHT -> Alignment.BottomEnd
                        }

                        Surface(
                            color = if (watermark.hasBackground) Color.Black.copy(alpha = 0.65f) else Color.Transparent,
                            shape = RoundedCornerShape(4.dp),
                            modifier = Modifier
                                .align(alignment)
                                .padding(4.dp)
                        ) {
                            Text(
                                text = watermark.text,
                                color = Color(watermark.colorHex).copy(alpha = watermark.opacity),
                                fontSize = watermark.fontSizeSp.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                // Font Generator Text Layer
                if (fontGenerator.text.isNotEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        val yOffset = ((fontGenerator.positionYPercent - 50f) * 2.2f).dp

                        Surface(
                            color = if (fontGenerator.bgPill) Color(fontGenerator.pillColorHex) else Color.Transparent,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .offset(y = yOffset)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = fontGenerator.text,
                                color = Color(fontGenerator.colorHex),
                                fontSize = fontGenerator.fontSizeSp.sp,
                                fontWeight = FontWeight.Black,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                // Subtitles Viral Captions Layer
                if (subtitles.enabled) {
                    val activeSubtitle = remember(currentTime, subtitles.items) {
                        subtitles.items.find { currentTime >= it.startTime && currentTime <= it.endTime }?.text
                            ?: "VIRAL HOOK OF THE YEAR 🔥"
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(12.dp),
                        contentAlignment = when (subtitles.position) {
                            "top" -> Alignment.TopCenter
                            "middle" -> Alignment.Center
                            else -> Alignment.BottomCenter
                        }
                    ) {
                        Surface(
                            color = if (subtitles.hasBackground) Color(0xDD000000) else Color.Transparent,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = activeSubtitle,
                                color = Color(subtitles.highlightColorHex),
                                fontSize = subtitles.fontSizeSp.sp,
                                fontWeight = FontWeight.ExtraBold,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }

                // Stickers Overlay Layer
                stickers.forEach { sticker ->
                    val xAlign = (sticker.xPercent / 100f).coerceIn(0.1f, 0.9f)
                    val yAlign = (sticker.yPercent / 100f).coerceIn(0.1f, 0.9f)

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(8.dp)
                    ) {
                        Surface(
                            color = if (sticker.type == "badge") AccentPink else Color.Transparent,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .align(Alignment.Center)
                                .offset(
                                    x = ((xAlign - 0.5f) * 200).dp,
                                    y = ((yAlign - 0.5f) * 200).dp
                                )
                                .clickable { onRemoveSticker(sticker.id) }
                        ) {
                            Text(
                                text = sticker.content,
                                fontSize = if (sticker.type == "badge") 13.sp else 30.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                            )
                        }
                    }
                }

                // Play / Pause Central Click Overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .clickable { onTogglePlay() },
                    contentAlignment = Alignment.Center
                ) {
                    if (!isPlaying) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .clip(CircleShape)
                                .background(Color.Black.copy(alpha = 0.6f))
                                .border(1.5.dp, PrimaryNeon, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Play",
                                tint = Color.White,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }
                }

                // Top Floating Indicators (Aspect Ratio, Speed, Audio)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.TopCenter)
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = Color.Black.copy(alpha = 0.7f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = aspectRatio.label,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = AccentCyan,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            if (speed != 1f) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "• ${speed}x",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = AccentAmber,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            }
                        }
                    }

                    if (audioSettings.muted) {
                        Surface(
                            color = Color.Red.copy(alpha = 0.8f),
                            shape = CircleShape,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.VolumeOff,
                                    contentDescription = "Muted",
                                    tint = Color.White,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                    } else if (audioSettings.bgmTrackId != null) {
                        Surface(
                            color = AccentPink.copy(alpha = 0.85f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.MusicNote,
                                    contentDescription = "BGM",
                                    tint = Color.White,
                                    modifier = Modifier.size(12.dp)
                                )
                                Spacer(modifier = Modifier.width(2.dp))
                                Text(
                                    text = "BGM On",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            }
                        }
                    }
                }
            }
        }

        // Timeline Scrub & Playback Controls Bar
        Surface(
            color = StudioSurface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
            ) {
                // Slider with Start and End Trim bounds
                Slider(
                    value = currentTime,
                    onValueChange = { onSeek(it) },
                    valueRange = trimStart..trimEnd,
                    colors = SliderDefaults.colors(
                        thumbColor = PrimaryNeon,
                        activeTrackColor = PrimaryNeon,
                        inactiveTrackColor = DarkGrayTrack
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(24.dp)
                        .testTag("timeline_slider")
                )

                // Time Display and Action row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    IconButton(
                        onClick = onTogglePlay,
                        modifier = Modifier
                            .size(34.dp)
                            .testTag("play_pause_button")
                    ) {
                        Icon(
                            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = if (isPlaying) "Pause" else "Play",
                            tint = PrimaryNeon,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    // Formatted Timecodes
                    Text(
                        text = "${formatTime(currentTime)} / ${formatTime(trimEnd - trimStart)}",
                        style = MaterialTheme.typography.labelMedium.copy(
                            color = TextSecondary,
                            fontWeight = FontWeight.SemiBold
                        )
                    )

                    // Video Title and Duration Tag
                    Surface(
                        color = StudioSurfaceVariant,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = video.title,
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = TextMuted,
                                fontWeight = FontWeight.Medium
                            ),
                            maxLines = 1,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }
        }
    }
}

private fun formatTime(seconds: Float): String {
    val totalSec = seconds.toInt().coerceAtLeast(0)
    val mins = totalSec / 60
    val secs = totalSec % 60
    return String.format(Locale.US, "%02d:%02d", mins, secs)
}

private fun getColorFilterForType(filter: FilterType, intensity: Float): ColorFilter? {
    if (filter == FilterType.NONE) return null

    val cm = ColorMatrix()
    when (filter) {
        FilterType.SEPIA, FilterType.VINTAGE -> {
            cm.setToSaturation(0.6f)
            // warm sepia shift
            val array = floatArrayOf(
                0.393f + 0.607f * (1 - intensity), 0.769f * intensity, 0.189f * intensity, 0f, 0f,
                0.349f * intensity, 0.686f + 0.314f * (1 - intensity), 0.168f * intensity, 0f, 0f,
                0.272f * intensity, 0.534f * intensity, 0.131f + 0.869f * (1 - intensity), 0f, 0f,
                0f, 0f, 0f, 1f, 0f
            )
            return ColorFilter.colorMatrix(ColorMatrix(array))
        }
        FilterType.NOIR, FilterType.MONOCHROME_HIGH -> {
            cm.setToSaturation(1f - intensity)
            return ColorFilter.colorMatrix(cm)
        }
        FilterType.CYBERPUNK -> {
            cm.setToSaturation(1.8f * intensity)
            val array = floatArrayOf(
                1.3f, 0f, 0.3f, 0f, 20f * intensity,
                0f, 1.1f, 0.2f, 0f, 0f,
                0.4f, 0f, 1.6f, 0f, 40f * intensity,
                0f, 0f, 0f, 1f, 0f
            )
            return ColorFilter.colorMatrix(ColorMatrix(array))
        }
        FilterType.WARM, FilterType.GOLDEN, FilterType.KODAK_GOLD -> {
            cm.setToSaturation(1.3f)
            val array = floatArrayOf(
                1f + 0.25f * intensity, 0f, 0f, 0f, 15f * intensity,
                0f, 1f + 0.15f * intensity, 0f, 0f, 10f * intensity,
                0f, 0f, 1f - 0.15f * intensity, 0f, 0f,
                0f, 0f, 0f, 1f, 0f
            )
            return ColorFilter.colorMatrix(ColorMatrix(array))
        }
        FilterType.COOL, FilterType.EMERALD -> {
            cm.setToSaturation(1.2f)
            val array = floatArrayOf(
                1f - 0.15f * intensity, 0f, 0f, 0f, 0f,
                0f, 1f + 0.15f * intensity, 0f, 0f, 15f * intensity,
                0f, 0f, 1f + 0.3f * intensity, 0f, 25f * intensity,
                0f, 0f, 0f, 1f, 0f
            )
            return ColorFilter.colorMatrix(ColorMatrix(array))
        }
        FilterType.VIVID -> {
            cm.setToSaturation(1f + 0.8f * intensity)
            return ColorFilter.colorMatrix(cm)
        }
        FilterType.INVERT -> {
            val array = floatArrayOf(
                -1f * intensity + (1 - intensity), 0f, 0f, 0f, 255f * intensity,
                0f, -1f * intensity + (1 - intensity), 0f, 0f, 255f * intensity,
                0f, 0f, -1f * intensity + (1 - intensity), 0f, 255f * intensity,
                0f, 0f, 0f, 1f, 0f
            )
            return ColorFilter.colorMatrix(ColorMatrix(array))
        }
        else -> {
            cm.setToSaturation(1.3f)
            return ColorFilter.colorMatrix(cm)
        }
    }
}
