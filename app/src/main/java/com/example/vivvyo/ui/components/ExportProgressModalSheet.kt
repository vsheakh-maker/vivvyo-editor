package com.example.vivvyo.ui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vivvyo.model.ExportConfig
import com.example.vivvyo.ui.theme.*

@Composable
fun ExportProgressModalSheet(
    isExporting: Boolean,
    progress: Float,
    statusText: String,
    onStartExport: (ExportConfig) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var format by remember { mutableStateOf("MP4") }
    var resolution by remember { mutableStateOf("1080p") }
    var fps by remember { mutableIntStateOf(30) }

    val formats = listOf("MP4", "MOV", "WEBM")
    val resolutions = listOf("1080p", "4K", "720p")
    val fpsOptions = listOf(30, 60)

    Surface(
        color = StudioSurface,
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.FileUpload, contentDescription = null, tint = PrimaryNeon)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isExporting) "Rendering Video Studio Output..." else "Export Studio Video",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                if (!isExporting) {
                    IconButton(onClick = onClose) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            if (isExporting) {
                // Progress Display
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "${(progress * 100).toInt()}%",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            color = PrimaryNeonLight,
                            fontWeight = FontWeight.Black
                        )
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = PrimaryNeon,
                        trackColor = StudioSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = statusText,
                        style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary),
                        maxLines = 2
                    )
                }
            } else {
                // Export Configuration Settings
                Text("Export Container Format:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
                Spacer(modifier = Modifier.height(6.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    formats.forEach { fmt ->
                        val isSel = fmt == format
                        Surface(
                            color = if (isSel) PrimaryNeon.copy(alpha = 0.2f) else StudioSurfaceVariant,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(40.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .border(1.5.dp, if (isSel) PrimaryNeon else Color.Transparent, RoundedCornerShape(10.dp))
                                .clickable { format = fmt }
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(fmt, fontWeight = FontWeight.Bold, color = if (isSel) PrimaryNeonLight else TextPrimary)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Resolution & FPS
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Resolution:", style = MaterialTheme.typography.labelSmall)
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            resolutions.forEach { res ->
                                val isSel = res == resolution
                                Surface(
                                    color = if (isSel) AccentCyan else StudioSurfaceVariant,
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(32.dp)
                                        .clickable { resolution = res }
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(res, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (isSel) Color.Black else TextSecondary)
                                    }
                                }
                            }
                        }
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text("Frame Rate:", style = MaterialTheme.typography.labelSmall)
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            fpsOptions.forEach { f ->
                                val isSel = f == fps
                                Surface(
                                    color = if (isSel) AccentPink else StudioSurfaceVariant,
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(32.dp)
                                        .clickable { fps = f }
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text("${f} FPS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (isSel) Color.White else TextSecondary)
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = {
                        onStartExport(ExportConfig(format = format, resolution = resolution, fps = fps))
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("start_export_button")
                ) {
                    Icon(imageVector = Icons.Default.FileUpload, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Render & Save ($resolution • $format)", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
