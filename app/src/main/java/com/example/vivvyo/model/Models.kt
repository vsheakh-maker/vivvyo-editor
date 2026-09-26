package com.example.vivvyo.model

enum class ToolType(val title: String, val category: String) {
    TRIM("Trim Video", "Basics"),
    AUTO_CUT("Auto Cut Silence", "Smart"),
    CROP("Crop & Ratio", "Basics"),
    FILTER("Visual Filters", "Visuals"),
    AUDIO("Audio Mixer", "Audio"),
    SPEED("Speed & Curve", "Basics"),
    TRANSFORM("Rotate & Flip", "Basics"),
    TRANSITION("Transitions", "Visuals"),
    JOINER("Merge Clips", "Multi-Clip"),
    SUBTITLES("Viral Captions", "Text"),
    STICKERS("Stickers & Badges", "Visuals"),
    COMPRESS("Compressor", "Utility"),
    EXTRACT_AUDIO("Extract Audio", "Audio"),
    WATERMARK("Watermark", "Text"),
    SLIDESHOW("Photo Slideshow", "Multi-Clip"),
    TEMPLATES("TikTok Templates", "Trending"),
    BG_REMOVE("AI Cutout", "Smart"),
    FONT_GENERATOR("Font Studio", "Text")
}

enum class FilterType(val displayName: String, val badgeColorHex: Long) {
    NONE("Original", 0xFF52525B),
    CINEMATIC("Cinematic", 0xFFD97706),
    WARM("Golden Hour", 0xFFF97316),
    COOL("Teal & Cool", 0xFF0891B2),
    VIVID("Vivid Pop", 0xFFF43F5E),
    SEPIA("Vintage 90s", 0xFFB45309),
    NOIR("Monochrome", 0xFF3F3F46),
    CYBERPUNK("Cyberpunk", 0xFF9333EA),
    INVERT("X-Ray Invert", 0xFF059669),
    VINTAGE("Faded Film", 0xFF78716C),
    GOLDEN("Golden Glow", 0xFFEAB308),
    NEON_PINK("Neon Pink", 0xFFD946EF),
    PASTEL("Soft Pastel", 0xFF2DD4BF),
    VHS_GLITCH("VHS Glitch", 0xFFEF4444),
    MATRIX("Matrix Code", 0xFF10B981),
    DREAMY("Dreamy Bloom", 0xFFF472B6),
    KODAK_GOLD("Kodak Portra", 0xFFF59E0B),
    EMERALD("Emerald Forest", 0xFF0D9488),
    MONOCHROME_HIGH("Oppenheimer B&W", 0xFF18181B)
}

data class FilterPreset(
    val id: FilterType,
    val name: String,
    val badgeColorHex: Long
)

enum class AspectRatioType(val label: String, val sub: String, val ratio: Float?) {
    ORIGINAL("Original", "As recorded", null),
    RATIO_9_16("9:16", "TikTok / Reels", 9f / 16f),
    RATIO_1_1("1:1", "Square Post", 1f),
    RATIO_16_9("16:9", "YouTube", 16f / 9f),
    RATIO_4_5("4:5", "Instagram Feed", 4f / 5f),
    RATIO_4_3("4:3", "Classic TV", 4f / 3f),
    CUSTOM("Custom", "Freeform Crop", null)
}

data class CustomCropSettings(
    val widthRatio: Float = 16f,
    val heightRatio: Float = 9f,
    val zoom: Float = 1f,
    val offsetX: Float = 0f,
    val offsetY: Float = 0f
)

data class TransformSettings(
    val rotation: Float = 0f,
    val flipHorizontal: Boolean = false,
    val flipVertical: Boolean = false
)

data class AudioSettings(
    val muted: Boolean = false,
    val videoVolume: Float = 1f,
    val bgmTrackId: String? = null,
    val bgmVolume: Float = 0.6f
)

data class WatermarkSettings(
    val text: String = "",
    val position: WatermarkPosition = WatermarkPosition.BOTTOM_RIGHT,
    val colorHex: Long = 0xFFFFFFFF,
    val opacity: Float = 0.85f,
    val fontSizeSp: Float = 18f,
    val hasBackground: Boolean = true
)

enum class WatermarkPosition(val title: String) {
    TOP_LEFT("Top Left"),
    TOP_RIGHT("Top Right"),
    CENTER("Center"),
    BOTTOM_LEFT("Bottom Left"),
    BOTTOM_RIGHT("Bottom Right")
}

data class CompressionSettings(
    val targetResolution: String = "720p",
    val quality: String = "medium"
)

data class VideoAsset(
    val id: String,
    val title: String,
    val url: String,
    val duration: Float, // in seconds
    val width: Int = 1280,
    val height: Int = 720,
    val thumbnailUrl: String = ""
)

data class AudioTrack(
    val id: String,
    val title: String,
    val genre: String,
    val duration: Float,
    val bpm: Int,
    val type: String = "synth"
)

data class TikTokSong(
    val id: String,
    val title: String,
    val artist: String,
    val category: String, // viral, phonk, lofi, speedup, dance
    val duration: Float,
    val bpm: Int,
    val coverUrl: String,
    val views: String,
    val previewNoteFreq: Float
)

data class VideoTemplate(
    val id: String,
    val title: String,
    val subtitle: String,
    val category: String,
    val badge: String,
    val songId: String,
    val filterId: FilterType,
    val aspectRatio: AspectRatioType,
    val speed: Float,
    val sampleText: String,
    val fontStyleId: String,
    val previewImageUrl: String,
    val isTrending: Boolean = true
)

data class BgRemoverSettings(
    val tolerance: Float = 35f,
    val edgeSmooth: Float = 3f,
    val backgroundType: String = "blur", // transparent, color, gradient, blur
    val bgColorHex: Long = 0xFF000000,
    val bgGradient: String = "indigo"
)

data class FontGeneratorSettings(
    val text: String = "",
    val fontFamilyName: String = "Montserrat",
    val fontSizeSp: Float = 26f,
    val colorHex: Long = 0xFFFFFFFF,
    val strokeColorHex: Long = 0xFF000000,
    val strokeWidth: Float = 2f,
    val effect: String = "stroke", // none, glow, stroke, shadow, 3d, comic, bubble
    val glowColorHex: Long = 0xFF00F0FF,
    val bgPill: Boolean = false,
    val pillColorHex: Long = 0xCC000000,
    val positionYPercent: Float = 75f
)

data class ExportConfig(
    val format: String = "MP4",
    val resolution: String = "1080p",
    val fps: Int = 30,
    val quality: String = "high"
)

data class SlideshowImage(
    val id: String,
    val title: String,
    val url: String
)

enum class TransitionType(val displayName: String) {
    CROSS_DISSOLVE("Cross Dissolve"),
    FADE_BLACK("Fade to Black"),
    FADE_WHITE("Fade to White"),
    ZOOM_IN("Zoom In"),
    ZOOM_OUT("Zoom Out"),
    SLIDE_LEFT("Slide Left"),
    SLIDE_RIGHT("Slide Right"),
    BLUR_DISSOLVE("Blur Dissolve"),
    GLITCH("Cyber Glitch")
}

data class TransitionSettings(
    val type: TransitionType = TransitionType.CROSS_DISSOLVE,
    val durationSeconds: Float = 0.8f,
    val soundFx: String = "whoosh"
)

data class SubtitleItem(
    val id: String,
    val text: String,
    val startTime: Float,
    val endTime: Float
)

data class SubtitleStyleSettings(
    val enabled: Boolean = false,
    val preset: String = "hormozi", // hormozi, neon, minimal, netflix, comic
    val fontSizeSp: Float = 24f,
    val position: String = "bottom", // bottom, middle, top
    val primaryColorHex: Long = 0xFFFFFFFF,
    val highlightColorHex: Long = 0xFFEAB308,
    val hasBackground: Boolean = true,
    val items: List<SubtitleItem> = emptyList()
)

data class StickerOverlayItem(
    val id: String,
    val content: String,
    val type: String = "emoji", // emoji, badge, reaction
    val xPercent: Float = 50f,
    val yPercent: Float = 50f,
    val sizeDp: Float = 48f,
    val rotationDeg: Float = 0f
)

data class SilenceInterval(
    val id: String,
    val start: Float,
    val end: Float,
    val duration: Float,
    val enabled: Boolean = true
)

data class AutoCutSettings(
    val enabled: Boolean = false,
    val thresholdDb: Float = -32f,
    val minSilenceDuration: Float = 0.4f,
    val detectedSilences: List<SilenceInterval> = emptyList(),
    val autoSkipInPlayer: Boolean = false
)

data class EditorStateSnapshot(
    val filterType: FilterType,
    val transform: TransformSettings,
    val audioSettings: AudioSettings,
    val aspectRatio: AspectRatioType,
    val speed: Float,
    val trimStart: Float,
    val trimEnd: Float,
    val watermark: WatermarkSettings,
    val fontGenerator: FontGeneratorSettings,
    val label: String,
    val timestamp: Long = System.currentTimeMillis()
)
