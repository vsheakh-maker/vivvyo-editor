package com.example.vivvyo.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.vivvyo.data.SampleData
import com.example.vivvyo.data.local.ExportedItemEntity
import com.example.vivvyo.data.local.StudioProjectEntity
import com.example.vivvyo.model.*
import com.example.vivvyo.repository.VivvyoRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class EditorUiState(
    val currentVideo: VideoAsset = SampleData.SAMPLE_VIDEOS[0],
    val isPlaying: Boolean = false,
    val currentTime: Float = 0f,
    val duration: Float = 46f,
    val activeTool: ToolType? = null,
    val trimStart: Float = 0f,
    val trimEnd: Float = 46f,
    val aspectRatio: AspectRatioType = AspectRatioType.ORIGINAL,
    val customCrop: CustomCropSettings = CustomCropSettings(),
    val filterType: FilterType = FilterType.NONE,
    val filterIntensity: Float = 100f,
    val transform: TransformSettings = TransformSettings(),
    val audioSettings: AudioSettings = AudioSettings(),
    val speed: Float = 1f,
    val watermark: WatermarkSettings = WatermarkSettings(),
    val compression: CompressionSettings = CompressionSettings(),
    val fontGenerator: FontGeneratorSettings = FontGeneratorSettings(),
    val transition: TransitionSettings = TransitionSettings(),
    val subtitles: SubtitleStyleSettings = SubtitleStyleSettings(),
    val stickers: List<StickerOverlayItem> = emptyList(),
    val autoCut: AutoCutSettings = AutoCutSettings(),
    val isExporting: Boolean = false,
    val exportProgress: Float = 0f,
    val exportStatusText: String = "",
    val showStudioModal: Boolean = false,
    val showVideoPicker: Boolean = false,
    val showTemplatesModal: Boolean = false,
    val showBgRemoverModal: Boolean = false,
    val showFontGeneratorModal: Boolean = false,
    val showCameraRecorder: Boolean = false,
    val showExportModal: Boolean = false,
    val toastMessage: String? = null,
    val canUndo: Boolean = false,
    val canRedo: Boolean = false
)

class VivvyoEditorViewModel(
    private val repository: VivvyoRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(EditorUiState())
    val uiState: StateFlow<EditorUiState> = _uiState.asStateFlow()

    val exportedItems: StateFlow<List<ExportedItemEntity>> = repository.allExportedItems
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val undoStack = mutableListOf<EditorStateSnapshot>()
    private val redoStack = mutableListOf<EditorStateSnapshot>()

    private var playbackJob: Job? = null
    private var exportJob: Job? = null

    init {
        // Populate initial sample export if empty
        viewModelScope.launch {
            exportedItems.collect { items ->
                if (items.isEmpty()) {
                    repository.saveExportedItem(
                        ExportedItemEntity(
                            title = "Neon Beat TikTok Reel",
                            type = "video",
                            filePath = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
                            fileSizeBytes = 4820000L,
                            durationSeconds = 15f,
                            format = "MP4",
                            toolUsed = "Velocity Beat Sync",
                            thumbnailUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80"
                        )
                    )
                }
            }
        }
    }

    fun takeSnapshot(label: String) {
        val s = _uiState.value
        val snapshot = EditorStateSnapshot(
            filterType = s.filterType,
            transform = s.transform,
            audioSettings = s.audioSettings,
            aspectRatio = s.aspectRatio,
            speed = s.speed,
            trimStart = s.trimStart,
            trimEnd = s.trimEnd,
            watermark = s.watermark,
            fontGenerator = s.fontGenerator,
            label = label
        )
        undoStack.add(snapshot)
        redoStack.clear()
        _uiState.update { it.copy(canUndo = true, canRedo = false) }
    }

    fun undo() {
        if (undoStack.isEmpty()) return
        val currentSnap = EditorStateSnapshot(
            filterType = _uiState.value.filterType,
            transform = _uiState.value.transform,
            audioSettings = _uiState.value.audioSettings,
            aspectRatio = _uiState.value.aspectRatio,
            speed = _uiState.value.speed,
            trimStart = _uiState.value.trimStart,
            trimEnd = _uiState.value.trimEnd,
            watermark = _uiState.value.watermark,
            fontGenerator = _uiState.value.fontGenerator,
            label = "Before Undo"
        )
        redoStack.add(currentSnap)
        val prev = undoStack.removeAt(undoStack.lastIndex)
        _uiState.update {
            it.copy(
                filterType = prev.filterType,
                transform = prev.transform,
                audioSettings = prev.audioSettings,
                aspectRatio = prev.aspectRatio,
                speed = prev.speed,
                trimStart = prev.trimStart,
                trimEnd = prev.trimEnd,
                watermark = prev.watermark,
                fontGenerator = prev.fontGenerator,
                canUndo = undoStack.isNotEmpty(),
                canRedo = true
            )
        }
        showToast("Undone: ${prev.label}")
    }

    fun redo() {
        if (redoStack.isEmpty()) return
        val currentSnap = EditorStateSnapshot(
            filterType = _uiState.value.filterType,
            transform = _uiState.value.transform,
            audioSettings = _uiState.value.audioSettings,
            aspectRatio = _uiState.value.aspectRatio,
            speed = _uiState.value.speed,
            trimStart = _uiState.value.trimStart,
            trimEnd = _uiState.value.trimEnd,
            watermark = _uiState.value.watermark,
            fontGenerator = _uiState.value.fontGenerator,
            label = "Before Redo"
        )
        undoStack.add(currentSnap)
        val next = redoStack.removeAt(redoStack.lastIndex)
        _uiState.update {
            it.copy(
                filterType = next.filterType,
                transform = next.transform,
                audioSettings = next.audioSettings,
                aspectRatio = next.aspectRatio,
                speed = next.speed,
                trimStart = next.trimStart,
                trimEnd = next.trimEnd,
                watermark = next.watermark,
                fontGenerator = next.fontGenerator,
                canUndo = true,
                canRedo = redoStack.isNotEmpty()
            )
        }
        showToast("Redone: ${next.label}")
    }

    fun togglePlay() {
        val playing = !_uiState.value.isPlaying
        _uiState.update { it.copy(isPlaying = playing) }
        if (playing) {
            startPlaybackLoop()
        } else {
            playbackJob?.cancel()
        }
    }

    fun seekTo(time: Float) {
        val clamped = time.coerceIn(_uiState.value.trimStart, _uiState.value.trimEnd)
        _uiState.update { it.copy(currentTime = clamped) }
    }

    private fun startPlaybackLoop() {
        playbackJob?.cancel()
        playbackJob = viewModelScope.launch {
            while (_uiState.value.isPlaying) {
                delay(50)
                val state = _uiState.value
                val step = 0.05f * state.speed
                var nextTime = state.currentTime + step
                if (nextTime > state.trimEnd) {
                    nextTime = state.trimStart
                }
                _uiState.update { it.copy(currentTime = nextTime) }
            }
        }
    }

    fun selectVideo(video: VideoAsset) {
        playbackJob?.cancel()
        _uiState.update {
            it.copy(
                currentVideo = video,
                duration = video.duration,
                currentTime = 0f,
                trimStart = 0f,
                trimEnd = video.duration,
                isPlaying = false,
                showVideoPicker = false
            )
        }
        showToast("Loaded: ${video.title}")
    }

    fun openTool(tool: ToolType) {
        _uiState.update { it.copy(activeTool = tool) }
    }

    fun closeTool() {
        _uiState.update { it.copy(activeTool = null) }
    }

    fun updateTrim(start: Float, end: Float) {
        takeSnapshot("Trim Range")
        _uiState.update { it.copy(trimStart = start, trimEnd = end) }
    }

    fun updateAspectRatio(ratio: AspectRatioType) {
        takeSnapshot("Aspect Ratio: ${ratio.label}")
        _uiState.update { it.copy(aspectRatio = ratio) }
    }

    fun updateFilter(type: FilterType, intensity: Float = 100f) {
        takeSnapshot("Filter: ${type.displayName}")
        _uiState.update { it.copy(filterType = type, filterIntensity = intensity) }
    }

    fun updateSpeed(newSpeed: Float) {
        takeSnapshot("Speed ${newSpeed}x")
        _uiState.update { it.copy(speed = newSpeed) }
    }

    fun updateTransformRotation() {
        takeSnapshot("Rotate 90°")
        val cur = _uiState.value.transform
        val newRot = (cur.rotation + 90f) % 360f
        _uiState.update { it.copy(transform = cur.copy(rotation = newRot)) }
    }

    fun toggleFlipH() {
        takeSnapshot("Flip Horizontal")
        val cur = _uiState.value.transform
        _uiState.update { it.copy(transform = cur.copy(flipHorizontal = !cur.flipHorizontal)) }
    }

    fun toggleFlipV() {
        takeSnapshot("Flip Vertical")
        val cur = _uiState.value.transform
        _uiState.update { it.copy(transform = cur.copy(flipVertical = !cur.flipVertical)) }
    }

    fun updateAudio(settings: AudioSettings) {
        takeSnapshot("Audio Mix")
        _uiState.update { it.copy(audioSettings = settings) }
    }

    fun selectTikTokSong(song: TikTokSong) {
        takeSnapshot("Selected Song: ${song.title}")
        val currentAudio = _uiState.value.audioSettings
        _uiState.update {
            it.copy(
                audioSettings = currentAudio.copy(bgmTrackId = song.id, bgmVolume = 0.7f)
            )
        }
        showToast("Added Track: ${song.title} (${song.views} views)")
    }

    fun updateWatermark(watermark: WatermarkSettings) {
        takeSnapshot("Watermark")
        _uiState.update { it.copy(watermark = watermark) }
    }

    fun updateFontGenerator(settings: FontGeneratorSettings) {
        takeSnapshot("Font Text")
        _uiState.update { it.copy(fontGenerator = settings) }
    }

    fun updateSubtitles(settings: SubtitleStyleSettings) {
        takeSnapshot("Subtitles")
        _uiState.update { it.copy(subtitles = settings) }
    }

    fun addSticker(content: String, type: String = "emoji") {
        takeSnapshot("Add Sticker: $content")
        val newSticker = StickerOverlayItem(
            id = "stk-${System.currentTimeMillis()}",
            content = content,
            type = type,
            xPercent = 50f,
            yPercent = 45f
        )
        _uiState.update { it.copy(stickers = it.stickers + newSticker) }
        showToast("Added $content overlay")
    }

    fun removeSticker(id: String) {
        _uiState.update { it.copy(stickers = it.stickers.filter { s -> s.id != id }) }
    }

    fun applyTemplate(template: VideoTemplate) {
        takeSnapshot("Template: ${template.title}")
        _uiState.update {
            it.copy(
                filterType = template.filterId,
                aspectRatio = template.aspectRatio,
                speed = template.speed,
                audioSettings = it.audioSettings.copy(bgmTrackId = template.songId, bgmVolume = 0.8f),
                fontGenerator = it.fontGenerator.copy(
                    text = template.sampleText,
                    effect = "glow",
                    positionYPercent = 75f
                ),
                showTemplatesModal = false
            )
        }
        showToast("Applied Template: ${template.title}!")
    }

    fun startExport(config: ExportConfig) {
        exportJob?.cancel()
        _uiState.update {
            it.copy(
                isExporting = true,
                exportProgress = 0.05f,
                exportStatusText = "Rendering frames at ${config.resolution} (${config.fps} FPS)..."
            )
        }

        exportJob = viewModelScope.launch {
            for (step in 1..10) {
                delay(250)
                val progress = step / 10f
                val status = when (step) {
                    2 -> "Applying ${uiState.value.filterType.displayName} filter..."
                    4 -> "Encoding audio tracks and volume balance..."
                    6 -> "Rendering typography, subtitles & badges..."
                    8 -> "Muxing final ${config.format} stream..."
                    else -> "Finalizing high bitrate export..."
                }
                _uiState.update { it.copy(exportProgress = progress, exportStatusText = status) }
            }

            // Save to Room DB
            val newItem = ExportedItemEntity(
                title = "Vivvyo_${System.currentTimeMillis() % 10000}.${config.format.lowercase()}",
                type = "video",
                filePath = _uiState.value.currentVideo.url,
                fileSizeBytes = 7450000L,
                durationSeconds = _uiState.value.trimEnd - _uiState.value.trimStart,
                format = config.format,
                toolUsed = _uiState.value.activeTool?.title ?: "Multi-Track Studio",
                thumbnailUrl = _uiState.value.currentVideo.thumbnailUrl
            )
            repository.saveExportedItem(newItem)

            _uiState.update {
                it.copy(
                    isExporting = false,
                    showExportModal = false,
                    exportProgress = 1f
                )
            }
            showToast("Export Complete! Saved to My Studio.")
        }
    }

    fun deleteExport(item: ExportedItemEntity) {
        viewModelScope.launch {
            repository.deleteExportedItem(item)
            showToast("Deleted item: ${item.title}")
        }
    }

    fun showToast(msg: String) {
        _uiState.update { it.copy(toastMessage = msg) }
        viewModelScope.launch {
            delay(2800)
            _uiState.update { if (it.toastMessage == msg) it.copy(toastMessage = null) else it }
        }
    }

    fun toggleStudioModal(show: Boolean) = _uiState.update { it.copy(showStudioModal = show) }
    fun toggleVideoPicker(show: Boolean) = _uiState.update { it.copy(showVideoPicker = show) }
    fun toggleTemplatesModal(show: Boolean) = _uiState.update { it.copy(showTemplatesModal = show) }
    fun toggleBgRemoverModal(show: Boolean) = _uiState.update { it.copy(showBgRemoverModal = show) }
    fun toggleFontGeneratorModal(show: Boolean) = _uiState.update { it.copy(showFontGeneratorModal = show) }
    fun toggleCameraRecorder(show: Boolean) = _uiState.update { it.copy(showCameraRecorder = show) }
    fun toggleExportModal(show: Boolean) = _uiState.update { it.copy(showExportModal = show) }
}

class VivvyoViewModelFactory(private val repository: VivvyoRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(VivvyoEditorViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return VivvyoEditorViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
