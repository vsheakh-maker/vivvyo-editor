package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Subtitles
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
import com.example.vivvyo.model.SubtitleItem
import com.example.vivvyo.model.SubtitleStyleSettings
import com.example.vivvyo.ui.theme.*

@Composable
fun SubtitleToolSheet(
    settings: SubtitleStyleSettings,
    onUpdateSettings: (SubtitleStyleSettings) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var enabled by remember(settings.enabled) { mutableStateOf(settings.enabled) }
    var selectedPreset by remember(settings.preset) { mutableStateOf(settings.preset) }
    var fontSize by remember(settings.fontSizeSp) { mutableFloatStateOf(settings.fontSizeSp) }
    var position by remember(settings.position) { mutableStateOf(settings.position) }

    val presets = listOf("hormozi", "neon", "minimal", "netflix", "comic")
    val positions = listOf("bottom", "middle", "top")

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
                    Icon(imageVector = Icons.Default.Subtitles, contentDescription = null, tint = AccentAmber)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Viral Subtitles & Auto Captions",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Enable Captions Switch
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Display Dynamic Captions", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
                    Text("Auto-highlights active speech words", style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
                }
                Switch(
                    checked = enabled,
                    onCheckedChange = {
                        enabled = it
                        onUpdateSettings(
                            settings.copy(
                                enabled = it,
                                preset = selectedPreset,
                                fontSizeSp = fontSize,
                                position = position,
                                items = if (it && settings.items.isEmpty()) listOf(
                                    SubtitleItem("c1", "THIS VIDEO WILL BLOW YOUR MIND 🤯", 0f, 4f),
                                    SubtitleItem("c2", "WAIT TILL THE VERY END ⚡", 4f, 8f),
                                    SubtitleItem("c3", "LIKE AND FOLLOW FOR PART TWO 🔥", 8f, 15f)
                                ) else settings.items
                            )
                        )
                    },
                    colors = SwitchDefaults.colors(checkedThumbColor = AccentAmber, checkedTrackColor = AccentAmber.copy(alpha = 0.5f))
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Presets Selector
            Text("Viral Caption Preset Style:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
            Spacer(modifier = Modifier.height(6.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(presets) { p ->
                    val isSel = p == selectedPreset
                    Surface(
                        color = if (isSel) AccentAmber.copy(alpha = 0.2f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .height(44.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.5.dp, if (isSel) AccentAmber else Color.Transparent, RoundedCornerShape(10.dp))
                            .clickable {
                                selectedPreset = p
                                onUpdateSettings(settings.copy(preset = p))
                            }
                            .testTag("subtitle_preset_$p")
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(horizontal = 12.dp)) {
                            Text(
                                text = p.uppercase(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = if (isSel) AccentAmber else TextPrimary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Position & Font Size
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Position:", style = MaterialTheme.typography.labelSmall)
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.padding(top = 4.dp)) {
                        positions.forEach { pos ->
                            val isSel = pos == position
                            Surface(
                                color = if (isSel) PrimaryNeon else StudioSurfaceVariant,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .height(28.dp)
                                    .clickable {
                                        position = pos
                                        onUpdateSettings(settings.copy(position = pos))
                                    }
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(pos.capitalize(), fontSize = 10.sp, color = if (isSel) Color.White else TextSecondary)
                                }
                            }
                        }
                    }
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text("Font Size: ${fontSize.toInt()}sp", style = MaterialTheme.typography.labelSmall)
                    Slider(
                        value = fontSize,
                        onValueChange = {
                            fontSize = it
                            onUpdateSettings(settings.copy(fontSizeSp = it))
                        },
                        valueRange = 16f..36f,
                        colors = SliderDefaults.colors(thumbColor = AccentAmber, activeTrackColor = AccentAmber)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Button(
                onClick = onClose,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
            ) {
                Text("Done", fontWeight = FontWeight.Bold)
            }
        }
    }
}
