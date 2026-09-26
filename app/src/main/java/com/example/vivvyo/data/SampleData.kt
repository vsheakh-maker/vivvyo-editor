package com.example.vivvyo.data

import com.example.vivvyo.model.*

object SampleData {

    val SAMPLE_VIDEOS = listOf(
        VideoAsset(
            id = "sample-ocean",
            title = "Deep Ocean Waves",
            url = "https://vjs.zencdn.net/v/oceans.mp4",
            duration = 46f,
            width = 1280,
            height = 720,
            thumbnailUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
        ),
        VideoAsset(
            id = "sample-animation",
            title = "Neon Urban Beat",
            url = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            duration = 15f,
            width = 1280,
            height = 720,
            thumbnailUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80"
        ),
        VideoAsset(
            id = "sample-sintel",
            title = "Cinematic Fantasy Trailer",
            url = "https://media.w3.org/2010/05/sintel/trailer.mp4",
            duration = 52f,
            width = 1280,
            height = 720,
            thumbnailUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80"
        ),
        VideoAsset(
            id = "sample-flower",
            title = "Blossom Macro Bloom",
            url = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            duration = 10f,
            width = 1280,
            height = 720,
            thumbnailUrl = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=400&q=80"
        )
    )

    val AUDIO_TRACKS = listOf(
        AudioTrack("lofi-chill", "Lofi Chill Sunset", "Lofi / Hip Hop", 60f, 82),
        AudioTrack("upbeat-dance", "Electro Summer Vibes", "Electronic / Dance", 60f, 124),
        AudioTrack("cinematic-pulse", "Deep Horizon Atmos", "Cinematic / Drone", 60f, 90),
        AudioTrack("acoustic-breeze", "Sunny Day Acoustic", "Acoustic / Warm", 60f, 105)
    )

    val TIKTOK_TRENDING_SONGS = listOf(
        TikTokSong("tt-espresso", "Espresso", "Sabrina Carpenter", "viral", 30f, 120, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80", "2.8B", 330f),
        TikTokSong("tt-greedy", "Greedy", "Tate McRae", "viral", 28f, 111, "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=80", "3.4B", 293f),
        TikTokSong("tt-water", "Water", "Tyla", "viral", 32f, 117, "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80", "4.1B", 349f),
        TikTokSong("tt-paint-town-red", "Paint The Town Red", "Doja Cat", "viral", 30f, 100, "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&auto=format&fit=crop&q=80", "3.9B", 261f),
        TikTokSong("tt-too-sweet", "Too Sweet", "Hozier", "viral", 35f, 117, "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=150&auto=format&fit=crop&q=80", "1.9B", 220f),
        TikTokSong("tt-beautiful-things", "Beautiful Things", "Benson Boone", "viral", 30f, 105, "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80", "2.3B", 392f),
        TikTokSong("tt-texas-hold-em", "Texas Hold 'Em", "Beyoncé", "viral", 32f, 110, "https://images.unsplash.com/photo-1445985543469-433ecba627a0?w=150&auto=format&fit=crop&q=80", "1.7B", 294f),
        TikTokSong("tt-gata-only", "Gata Only", "FloyyMenor & Cris Mj", "viral", 29f, 100, "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150&auto=format&fit=crop&q=80", "2.5B", 311f),
        TikTokSong("tt-phonk-overdrive", "Overdrive Drift 2026", "Kordhell & Phonk Mafia", "phonk", 27f, 155, "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150&auto=format&fit=crop&q=80", "3.3B", 115f),
        TikTokSong("tt-fein", "FE!N", "Travis Scott ft. Playboi Carti", "dance", 28f, 140, "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80", "4.8B", 130f),
        TikTokSong("tt-million-dollar-baby", "Million Dollar Baby", "Tommy Richman", "dance", 29f, 138, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80", "3.9B", 293f),
        TikTokSong("tt-not-like-us", "Not Like Us", "Kendrick Lamar", "dance", 30f, 101, "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&auto=format&fit=crop&q=80", "4.9B", 196f),
        TikTokSong("tt-tokyo-rain-lofi", "Tokyo Midnight Rain & Lofi", "ChilledCow Society", "lofi", 35f, 82, "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150&auto=format&fit=crop&q=80", "1.9B", 196f),
        TikTokSong("tt-diet-dew-spedup", "Diet Mountain Dew (Sped Up)", "Lana Del Rey Nightcore", "speedup", 25f, 142, "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=150&auto=format&fit=crop&q=80", "2.8B", 310f),
        TikTokSong("tt-stargazing-myles", "Stargazing", "Myles Smith", "aesthetic", 30f, 110, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=80", "2.5B", 247f)
    )

    val VIDEO_TEMPLATES = listOf(
        VideoTemplate(
            id = "tpl-velocity",
            title = "Velocity Beat Sync",
            subtitle = "High energy cuts synced to phonk bass drop",
            category = "viral",
            badge = "🔥 #1 Trending",
            songId = "tt-phonk-overdrive",
            filterId = FilterType.CYBERPUNK,
            aspectRatio = AspectRatioType.RATIO_9_16,
            speed = 1.5f,
            sampleText = "VELOCITY DROP ⚡",
            fontStyleId = "orbitron",
            previewImageUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80"
        ),
        VideoTemplate(
            id = "tpl-aesthetic-day",
            title = "Aesthetic Day in My Life",
            subtitle = "Warm soft glow, cozy lofi vibes, and clean subtitles",
            category = "aesthetic",
            badge = "✨ Aesthetic",
            songId = "tt-tokyo-rain-lofi",
            filterId = FilterType.WARM,
            aspectRatio = AspectRatioType.RATIO_9_16,
            speed = 1.0f,
            sampleText = "6:30 AM routine ☕",
            fontStyleId = "montserrat",
            previewImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80"
        ),
        VideoTemplate(
            id = "tpl-retro-vhs",
            title = "90s Retro VHS Cam",
            subtitle = "Nostalgic vintage scanlines, warm saturation, and tape grain",
            category = "retro",
            badge = "📼 Retro",
            songId = "tt-diet-dew-spedup",
            filterId = FilterType.VHS_GLITCH,
            aspectRatio = AspectRatioType.RATIO_4_3,
            speed = 1.0f,
            sampleText = "PLAY ▶ 1998",
            fontStyleId = "press_start",
            previewImageUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80"
        ),
        VideoTemplate(
            id = "tpl-gym-beast",
            title = "Gym Heavy Motivation",
            subtitle = "High contrast black & white with speed ramping",
            category = "fitness",
            badge = "💪 Fitness",
            songId = "tt-fein",
            filterId = FilterType.MONOCHROME_HIGH,
            aspectRatio = AspectRatioType.RATIO_9_16,
            speed = 1.25f,
            sampleText = "DISCIPLINE > MOTIVATION",
            fontStyleId = "cinzel",
            previewImageUrl = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80"
        ),
        VideoTemplate(
            id = "tpl-cinematic-travel",
            title = "Epic Travel Cinematic",
            subtitle = "Kodak gold tones with smooth cinematic widescreen bars",
            category = "travel",
            badge = "🌍 Travel",
            songId = "tt-stargazing-myles",
            filterId = FilterType.KODAK_GOLD,
            aspectRatio = AspectRatioType.RATIO_16_9,
            speed = 0.85f,
            sampleText = "EXPLORE THE UNKNOWN",
            fontStyleId = "playfair",
            previewImageUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop&q=80"
        )
    )

    val TRENDING_STICKERS = listOf(
        "🔥", "✨", "⚡", "💯", "🤯", "🚀", "👑", "👀",
        "VIRAL", "POV", "WAIT FOR IT", "MUST WATCH", "NEW DROP", "PART 2?", "10/10", "BREAKING"
    )

    val SAMPLE_SLIDESHOW_IMAGES = listOf(
        SlideshowImage("img-1", "Mountain Sunrise", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"),
        SlideshowImage("img-2", "Golden Coast", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"),
        SlideshowImage("img-3", "Neon Cyber City", "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80"),
        SlideshowImage("img-4", "Autumn Forest", "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80")
    )
}
