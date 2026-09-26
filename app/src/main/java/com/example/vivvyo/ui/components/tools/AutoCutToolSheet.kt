package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vivvyo.model.AutoCutSettings
import com.example.vivvyo.model.SilenceInterval
import com.example.vivvyo.ui.theme.*

@Composable
fun AutoCutToolSheet(
    settings: AutoCutSettings,
    onUpdateSettings: (AutoCutSettings) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var threshold by remember { mutableFloatStateOf(settings.thresholdDb) }
    var minDuration by remember { mutableFloatStateOf(settings.minSilenceDuration) }
    var autoSkip by remember { mutableStateOf(settings.autoSkipInPlayer) }
    var isAnalyzing by remember { mutableStateOf(false) }
    var detectedSilences by remember { mutableStateOf(settings.detectedSilences) }

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
                    Icon(imageVector = Icons.Default.FlashOn, contentDescription = null, tint = AccentAmber)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Auto-Cut Silence (AI Jump Cuts)",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Automatically detect and remove dead air and pauses for fast-paced viral retention.",
                style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Silence Threshold dB Slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Silence Sensitivity:", style = MaterialTheme.typography.labelMedium)
                Text("${threshold.toInt()} dB", color = AccentAmber, fontWeight = FontWeight.Bold)
            }
            Slider(
                value = threshold,
                onValueChange = { threshold = it },
                valueRange = -50f..-15f,
                colors = SliderDefaults.colors(thumbColor = AccentAmber, activeTrackColor = AccentAmber)
            )

            // Minimum Silence Duration Slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Min Silence Duration:", style = MaterialTheme.typography.labelMedium)
                Text("${String.format("%.2f", minDuration)} s", color = AccentCyan, fontWeight = FontWeight.Bold)
            }
            Slider(
                value = minDuration,
                onValueChange = { minDuration = it },
                valueRange = 0.2f..1.5f,
                colors = SliderDefaults.colors(thumbColor = AccentCyan, activeTrackColor = AccentCyan)
            )

            // Live Skip In Preview Toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Auto-Skip During Playback", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
                    Text("Skip quiet sections automatically in preview", style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
                }
                Switch(
                    checked = autoSkip,
                    onCheckedChange = { autoSkip = it },
                    colors = SwitchDefaults.colors(checkedThumbColor = AccentAmber, checkedTrackColor = AccentAmber.copy(alpha = 0.5f))
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    isAnalyzing = true
                    // Simulate silence detection results
                    detectedSilences = listOf(
                        SilenceInterval("s1", 4.2f, 5.6f, 1.4f),
                        SilenceInterval("s2", 12.1f, 13.8f, 1.7f),
                        SilenceInterval("s3", 22.4f, 23.3f, 0.9f)
                    )
                    onUpdateSettings(
                        settings.copy(
                            enabled = true,
                            thresholdDb = threshold,
                            minSilenceDuration = minDuration,
                            detectedSilences = detectedSilences,
                            autoSkipInPlayer = autoSkip
                        )
                    )
                    isAnalyzing = false
                },
                colors = ButtonDefaults.buttonColors(containerColor = AccentAmber),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
                    .testTag("detect_silence_button")
            ) {
                Text("Detect & Cut 3 Pauses (3.8s Saved)", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        }
    }
}
