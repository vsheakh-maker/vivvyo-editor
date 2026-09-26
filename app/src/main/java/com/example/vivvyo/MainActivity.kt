package com.example.vivvyo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.vivvyo.model.*
import com.example.vivvyo.repository.VivvyoRepository
import com.example.vivvyo.ui.components.*
import com.example.vivvyo.ui.components.tools.*
import com.example.vivvyo.ui.theme.*
import com.example.vivvyo.viewmodel.VivvyoEditorViewModel
import com.example.vivvyo.viewmodel.VivvyoViewModelFactory

class MainActivity : ComponentActivity() {

    private val viewModel: VivvyoEditorViewModel by viewModels {
        val app = application as VivvyoApplication
        VivvyoViewModelFactory(VivvyoRepository(app.database.projectDao()))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            VivvyoTheme {
                VivvyoStudioScreen(viewModel = viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VivvyoStudioScreen(viewModel: VivvyoEditorViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val exportedItems by viewModel.exportedItems.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.toastMessage) {
        uiState.toastMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
        }
    }

    Scaffold(
        containerColor = StudioDarkBackground,
        contentWindowInsets = WindowInsets.systemBars,
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState) { data ->
                Snackbar(
                    snackbarData = data,
                    containerColor = StudioSurfaceVariant,
                    contentColor = TextPrimary,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.padding(16.dp)
                )
            }
        },
        topBar = {
            StudioHeader(
                canUndo = uiState.canUndo,
                canRedo = uiState.canRedo,
                exportedCount = exportedItems.size,
                onUndo = { viewModel.undo() },
                onRedo = { viewModel.redo() },
                onOpenTemplates = { viewModel.toggleTemplatesModal(true) },
                onOpenStudio = { viewModel.toggleStudioModal(true) },
                onOpenExport = { viewModel.toggleExportModal(true) },
                onOpenPicker = { viewModel.toggleVideoPicker(true) },
                onOpenCamera = { viewModel.toggleCameraRecorder(true) }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(StudioDarkBackground)
            ) {
                // Video Player & Canvas Preview
                VideoPlayerPreview(
                    video = uiState.currentVideo,
                    isPlaying = uiState.isPlaying,
                    currentTime = uiState.currentTime,
                    duration = uiState.duration,
                    trimStart = uiState.trimStart,
                    trimEnd = uiState.trimEnd,
                    aspectRatio = uiState.aspectRatio,
                    filterType = uiState.filterType,
                    filterIntensity = uiState.filterIntensity,
                    transform = uiState.transform,
                    speed = uiState.speed,
                    watermark = uiState.watermark,
                    fontGenerator = uiState.fontGenerator,
                    subtitles = uiState.subtitles,
                    stickers = uiState.stickers,
                    audioSettings = uiState.audioSettings,
                    onTogglePlay = { viewModel.togglePlay() },
                    onSeek = { viewModel.seekTo(it) },
                    onRemoveSticker = { viewModel.removeSticker(it) }
                )

                // Tool Grid
                ToolGrid(
                    onSelectTool = { tool ->
                        when (tool) {
                            ToolType.TEMPLATES -> viewModel.toggleTemplatesModal(true)
                            ToolType.BG_REMOVE -> viewModel.toggleBgRemoverModal(true)
                            ToolType.FONT_GENERATOR -> viewModel.toggleFontGeneratorModal(true)
                            else -> viewModel.openTool(tool)
                        }
                    },
                    modifier = Modifier.weight(1f)
                )
            }

            // Bottom Sheets / Modals for active tools
            AnimatedVisibility(
                visible = uiState.activeTool != null,
                enter = slideInVertically(initialOffsetY = { it }),
                exit = slideOutVertically(targetOffsetY = { it }),
                modifier = Modifier.align(Alignment.BottomCenter)
            ) {
                when (uiState.activeTool) {
                    ToolType.TRIM -> TrimToolSheet(
                        duration = uiState.duration,
                        currentStart = uiState.trimStart,
                        currentEnd = uiState.trimEnd,
                        onApplyTrim = { s, e -> viewModel.updateTrim(s, e) },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.AUTO_CUT -> AutoCutToolSheet(
                        settings = uiState.autoCut,
                        onUpdateSettings = {
                            viewModel.showToast("Silence cut points applied!")
                            viewModel.closeTool()
                        },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.CROP -> CropToolSheet(
                        currentRatio = uiState.aspectRatio,
                        onSelectRatio = { viewModel.updateAspectRatio(it) },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.FILTER -> FilterToolSheet(
                        currentFilter = uiState.filterType,
                        intensity = uiState.filterIntensity,
                        onSelectFilter = { f, i -> viewModel.updateFilter(f, i) },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.AUDIO -> AudioMixerToolSheet(
                        settings = uiState.audioSettings,
                        onUpdateSettings = { viewModel.updateAudio(it) },
                        onSelectSong = { viewModel.selectTikTokSong(it) },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.SPEED -> SpeedToolSheet(
                        currentSpeed = uiState.speed,
                        onSelectSpeed = { viewModel.updateSpeed(it) },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.TRANSFORM -> TransformToolSheet(
                        transform = uiState.transform,
                        onRotate = { viewModel.updateTransformRotation() },
                        onFlipH = { viewModel.toggleFlipH() },
                        onFlipV = { viewModel.toggleFlipV() },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.TRANSITION -> TransitionToolSheet(
                        settings = uiState.transition,
                        onUpdateSettings = { viewModel.showToast("Applied transition: ${it.type.displayName}") },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.JOINER -> VideoJoinerToolSheet(
                        initialClips = listOf(uiState.currentVideo),
                        onMergeClips = { clips ->
                            viewModel.showToast("Merged ${clips.size} clips into studio timeline!")
                        },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.SUBTITLES -> SubtitleToolSheet(
                        settings = uiState.subtitles,
                        onUpdateSettings = { viewModel.updateSubtitles(it) },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.STICKERS -> StickersToolSheet(
                        activeStickers = uiState.stickers,
                        onAddSticker = { content, type -> viewModel.addSticker(content, type) },
                        onRemoveSticker = { viewModel.removeSticker(it) },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.COMPRESS -> CompressorToolSheet(
                        settings = uiState.compression,
                        onUpdateSettings = { viewModel.showToast("Optimized to ${it.targetResolution} (${it.quality})") },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.EXTRACT_AUDIO -> ExtractAudioToolSheet(
                        videoTitle = uiState.currentVideo.title,
                        onExtract = { fmt, bitrate ->
                            viewModel.showToast("Saved $fmt ($bitrate) to My Studio!")
                        },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.WATERMARK -> WatermarkToolSheet(
                        settings = uiState.watermark,
                        onUpdateSettings = { viewModel.updateWatermark(it) },
                        onClose = { viewModel.closeTool() }
                    )
                    ToolType.SLIDESHOW -> SlideshowToolSheet(
                        onGenerateSlideshow = { _, _ ->
                            viewModel.showToast("Rendered photos slideshow video!")
                        },
                        onClose = { viewModel.closeTool() }
                    )
                    else -> Unit
                }
            }

            // Trending Templates Modal
            if (uiState.showTemplatesModal) {
                TemplatesModalSheet(
                    onApplyTemplate = { viewModel.applyTemplate(it) },
                    onClose = { viewModel.toggleTemplatesModal(false) },
                    modifier = Modifier.align(Alignment.BottomCenter)
                )
            }

            // AI Cutout & Background Remover Modal
            if (uiState.showBgRemoverModal) {
                BgRemoverModalSheet(
                    settings = BgRemoverSettings(),
                    onUpdateSettings = { viewModel.showToast("AI Background replaced!") },
                    onClose = { viewModel.toggleBgRemoverModal(false) },
                    modifier = Modifier.align(Alignment.BottomCenter)
                )
            }

            // Font Studio Modal
            if (uiState.showFontGeneratorModal) {
                FontGeneratorModalSheet(
                    settings = uiState.fontGenerator,
                    onUpdateSettings = { viewModel.updateFontGenerator(it) },
                    onClose = { viewModel.toggleFontGeneratorModal(false) },
                    modifier = Modifier.align(Alignment.BottomCenter)
                )
            }

            // My Studio Modal
            if (uiState.showStudioModal) {
                MyStudioModalSheet(
                    exportedItems = exportedItems,
                    onDeleteItem = { viewModel.deleteExport(it) },
                    onClose = { viewModel.toggleStudioModal(false) },
                    modifier = Modifier.align(Alignment.BottomCenter)
                )
            }

            // Export Modal
            if (uiState.showExportModal) {
                ExportProgressModalSheet(
                    isExporting = uiState.isExporting,
                    progress = uiState.exportProgress,
                    statusText = uiState.exportStatusText,
                    onStartExport = { viewModel.startExport(it) },
                    onClose = { viewModel.toggleExportModal(false) },
                    modifier = Modifier.align(Alignment.BottomCenter)
                )
            }

            // Camera Recorder Modal
            if (uiState.showCameraRecorder) {
                CameraRecorderModalSheet(
                    onSaveRecording = { viewModel.selectVideo(it) },
                    onClose = { viewModel.toggleCameraRecorder(false) },
                    modifier = Modifier.align(Alignment.BottomCenter)
                )
            }

            // Video Picker Modal
            if (uiState.showVideoPicker) {
                VideoPickerModalSheet(
                    onSelectVideo = { viewModel.selectVideo(it) },
                    onClose = { viewModel.toggleVideoPicker(false) },
                    modifier = Modifier.align(Alignment.BottomCenter)
                )
            }
        }
    }
}
