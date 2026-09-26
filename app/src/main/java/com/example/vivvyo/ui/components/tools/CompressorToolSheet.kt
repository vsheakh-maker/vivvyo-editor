package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Compress
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
import com.example.vivvyo.model.CompressionSettings
import com.example.vivvyo.ui.theme.*

@Composable
fun CompressorToolSheet(
    settings: CompressionSettings,
    onUpdateSettings: (CompressionSettings) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var resolution by remember(settings.targetResolution) { mutableStateOf(settings.targetResolution) }
    var quality by remember(settings.quality) { mutableStateOf(settings.quality) }

    val resolutions = listOf("4K", "1080p", "720p", "480p")
    val qualities = listOf("high", "medium", "low")

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
                    Icon(imageVector = Icons.Default.Compress, contentDescription = null, tint = AccentCyan)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Video Compression & Optimization",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Resolution selection
            Text("Target Resolution:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
            Spacer(modifier = Modifier.height(6.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(resolutions) { res ->
                    val isSel = res == resolution
                    Surface(
                        color = if (isSel) AccentCyan.copy(alpha = 0.2f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .height(44.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.5.dp, if (isSel) AccentCyan else Color.Transparent, RoundedCornerShape(10.dp))
                            .clickable {
                                resolution = res
                                onUpdateSettings(settings.copy(targetResolution = res))
                            }
                            .testTag("res_$res")
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(horizontal = 16.dp)) {
                            Text(
                                text = res,
                                fontWeight = FontWeight.Bold,
                                color = if (isSel) AccentCyan else TextPrimary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Quality selection
            Text("Bitrate Quality Mode:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
            Spacer(modifier = Modifier.height(6.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                qualities.forEach { q ->
                    val isSel = q == quality
                    Surface(
                        color = if (isSel) PrimaryNeon else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(36.dp)
                            .clickable {
                                quality = q
                                onUpdateSettings(settings.copy(quality = q))
                            }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = q.uppercase(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSel) Color.White else TextSecondary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Estimated Savings Box
            Surface(
                color = StudioSurfaceVariant,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Estimated Reduction:", style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
                        Text(
                            text = when (resolution) {
                                "480p" -> "~ 75% smaller file"
                                "720p" -> "~ 50% smaller file"
                                "1080p" -> "~ 25% smaller file"
                                else -> "Maximum visual fidelity"
                            },
                            style = MaterialTheme.typography.bodyMedium.copy(color = AccentCyan, fontWeight = FontWeight.Bold)
                        )
                    }
                    Text("H.264 / AAC", style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onClose,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
            ) {
                Text("Save Settings", fontWeight = FontWeight.Bold)
            }
        }
    }
}
