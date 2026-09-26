package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.Done
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vivvyo.ui.theme.*
import java.util.Locale

@Composable
fun TrimToolSheet(
    duration: Float,
    currentStart: Float,
    currentEnd: Float,
    onApplyTrim: (Float, Float) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var start by remember(currentStart) { mutableFloatStateOf(currentStart) }
    var end by remember(currentEnd) { mutableFloatStateOf(currentEnd) }

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
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.ContentCut,
                        contentDescription = null,
                        tint = PrimaryNeon,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Trim & Cut Video",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Time range display
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Surface(
                    color = StudioSurfaceVariant,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)) {
                        Text("START", style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
                        Text(formatSec(start), style = MaterialTheme.typography.bodyLarge.copy(color = AccentCyan, fontWeight = FontWeight.Bold))
                    }
                }

                Surface(
                    color = StudioSurfaceVariant,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)) {
                        Text("DURATION", style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
                        Text(formatSec(end - start), style = MaterialTheme.typography.bodyLarge.copy(color = AccentPink, fontWeight = FontWeight.Bold))
                    }
                }

                Surface(
                    color = StudioSurfaceVariant,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)) {
                        Text("END", style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
                        Text(formatSec(end), style = MaterialTheme.typography.bodyLarge.copy(color = PrimaryNeonLight, fontWeight = FontWeight.Bold))
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Dual Slider (Start and End)
            Text("Adjust Start Trim Point:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
            Slider(
                value = start,
                onValueChange = { start = it.coerceAtMost(end - 1f) },
                valueRange = 0f..duration,
                colors = SliderDefaults.colors(thumbColor = AccentCyan, activeTrackColor = AccentCyan)
            )

            Text("Adjust End Trim Point:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
            Slider(
                value = end,
                onValueChange = { end = it.coerceAtLeast(start + 1f) },
                valueRange = 0f..duration,
                colors = SliderDefaults.colors(thumbColor = PrimaryNeonLight, activeTrackColor = PrimaryNeonLight)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Quick Presets
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { start = 0f; end = duration },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Reset Full", fontSize = 11.sp)
                }
                OutlinedButton(
                    onClick = { start = 0f; end = minOf(15f, duration) },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("15s Reel", fontSize = 11.sp)
                }
                OutlinedButton(
                    onClick = { start = 0f; end = minOf(30f, duration) },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("30s TikTok", fontSize = 11.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Apply Button
            Button(
                onClick = {
                    onApplyTrim(start, end)
                    onClose()
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
                    .testTag("apply_trim_button")
            ) {
                Icon(imageVector = Icons.Default.Done, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Apply Trim", fontWeight = FontWeight.Bold)
            }
        }
    }
}

private fun formatSec(s: Float): String {
    val totalSec = s.toInt().coerceAtLeast(0)
    val mins = totalSec / 60
    val secs = totalSec % 60
    return String.format(Locale.US, "%02d:%02d", mins, secs)
}
