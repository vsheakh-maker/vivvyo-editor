package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Transform
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
import com.example.vivvyo.model.TransitionSettings
import com.example.vivvyo.model.TransitionType
import com.example.vivvyo.ui.theme.*

@Composable
fun TransitionToolSheet(
    settings: TransitionSettings,
    onUpdateSettings: (TransitionSettings) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var dur by remember(settings.durationSeconds) { mutableFloatStateOf(settings.durationSeconds) }
    var currentType by remember(settings.type) { mutableStateOf(settings.type) }
    var soundFx by remember(settings.soundFx) { mutableStateOf(settings.soundFx) }

    val soundOptions = listOf("none", "whoosh", "swish", "pop", "glitch")

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
                    Icon(imageVector = Icons.Default.Transform, contentDescription = null, tint = AccentPink)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Clip & Scene Transitions",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Transition types carousel
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(TransitionType.values()) { type ->
                    val isSel = type == currentType
                    Surface(
                        color = if (isSel) AccentPink.copy(alpha = 0.2f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .width(110.dp)
                            .height(60.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.5.dp, if (isSel) AccentPink else Color.Transparent, RoundedCornerShape(10.dp))
                            .clickable {
                                currentType = type
                                onUpdateSettings(settings.copy(type = type, durationSeconds = dur, soundFx = soundFx))
                            }
                            .testTag("transition_${type.name.lowercase()}")
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(6.dp)) {
                            Text(
                                text = type.displayName,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSel) AccentPink else TextPrimary
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Duration Slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Transition Duration:", style = MaterialTheme.typography.labelMedium)
                Text("${String.format("%.1f", dur)}s", color = AccentPink, fontWeight = FontWeight.Bold)
            }
            Slider(
                value = dur,
                onValueChange = {
                    dur = it
                    onUpdateSettings(settings.copy(durationSeconds = it))
                },
                valueRange = 0.3f..2.0f,
                colors = SliderDefaults.colors(thumbColor = AccentPink, activeTrackColor = AccentPink)
            )

            // Sound FX Selector
            Text("Transition Audio SFX:", style = MaterialTheme.typography.labelMedium)
            Spacer(modifier = Modifier.height(6.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(soundOptions) { fx ->
                    val isSel = soundFx == fx
                    Surface(
                        color = if (isSel) PrimaryNeon else StudioSurfaceVariant,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .height(26.dp)
                            .clickable {
                                soundFx = fx
                                onUpdateSettings(settings.copy(soundFx = fx))
                            }
                    ) {
                        Text(
                            text = fx.uppercase(),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSel) Color.White else TextSecondary,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
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
                Text("Apply Transition", fontWeight = FontWeight.Bold)
            }
        }
    }
}
