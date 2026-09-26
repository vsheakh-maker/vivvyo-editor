package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Audiotrack
import androidx.compose.material.icons.filled.Close
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
import com.example.vivvyo.ui.theme.*

@Composable
fun ExtractAudioToolSheet(
    videoTitle: String,
    onExtract: (format: String, bitrate: String) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var format by remember { mutableStateOf("MP3") }
    var bitrate by remember { mutableStateOf("320 kbps") }

    val formats = listOf("MP3", "AAC", "WAV", "M4A")
    val bitrates = listOf("320 kbps", "256 kbps", "192 kbps", "128 kbps")

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
                    Icon(imageVector = Icons.Default.Audiotrack, contentDescription = null, tint = PrimaryNeonLight)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Extract Audio Track",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text("Extract high-definition audio stem from: \"$videoTitle\"", style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary))

            Spacer(modifier = Modifier.height(14.dp))

            // Audio Format
            Text("Audio Codec Format:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
            Spacer(modifier = Modifier.height(6.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                formats.forEach { fmt ->
                    val isSel = fmt == format
                    Surface(
                        color = if (isSel) PrimaryNeon.copy(alpha = 0.2f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(42.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.5.dp, if (isSel) PrimaryNeon else Color.Transparent, RoundedCornerShape(10.dp))
                            .clickable { format = fmt }
                            .testTag("audio_format_$fmt")
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = fmt,
                                fontWeight = FontWeight.Bold,
                                color = if (isSel) PrimaryNeonLight else TextPrimary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Bitrate
            Text("Target Bitrate Quality:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
            Spacer(modifier = Modifier.height(6.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                bitrates.forEach { b ->
                    val isSel = b == bitrate
                    Surface(
                        color = if (isSel) AccentCyan.copy(alpha = 0.2f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(38.dp)
                            .clickable { bitrate = b }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = b,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (isSel) AccentCyan else TextSecondary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            Button(
                onClick = {
                    onExtract(format, bitrate)
                    onClose()
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
                    .testTag("extract_audio_button")
            ) {
                Icon(imageVector = Icons.Default.Audiotrack, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Extract & Save $format File", fontWeight = FontWeight.Bold)
            }
        }
    }
}
