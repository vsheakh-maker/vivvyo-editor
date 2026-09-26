package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.TextFields
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
import com.example.vivvyo.model.FontGeneratorSettings
import com.example.vivvyo.ui.theme.*

@Composable
fun FontGeneratorModalSheet(
    settings: FontGeneratorSettings,
    onUpdateSettings: (FontGeneratorSettings) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var text by remember(settings.text) { mutableStateOf(settings.text) }
    var effect by remember(settings.effect) { mutableStateOf(settings.effect) }
    var fontSize by remember(settings.fontSizeSp) { mutableFloatStateOf(settings.fontSizeSp) }
    var posY by remember(settings.positionYPercent) { mutableFloatStateOf(settings.positionYPercent) }
    var hasPill by remember(settings.bgPill) { mutableStateOf(settings.bgPill) }

    val effects = listOf("stroke", "glow", "3d", "comic", "bubble", "none")

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
                    Icon(imageVector = Icons.Default.TextFields, contentDescription = null, tint = PrimaryNeon)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Font Studio & Viral Text Generator",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Text Input
            OutlinedTextField(
                value = text,
                onValueChange = {
                    text = it
                    onUpdateSettings(settings.copy(text = it))
                },
                placeholder = { Text("Enter video hook, title, or viral copy...") },
                singleLine = false,
                maxLines = 2,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("font_text_input"),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryNeon,
                    unfocusedBorderColor = StudioCardBorder
                )
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Effect Selector
            Text("Visual Styling Effect:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
            Spacer(modifier = Modifier.height(6.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(effects) { eff ->
                    val isSel = eff == effect
                    Surface(
                        color = if (isSel) PrimaryNeon.copy(alpha = 0.25f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .height(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.5.dp, if (isSel) PrimaryNeon else Color.Transparent, RoundedCornerShape(10.dp))
                            .clickable {
                                effect = eff
                                onUpdateSettings(settings.copy(effect = eff))
                            }
                            .testTag("font_effect_$eff")
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(horizontal = 12.dp)) {
                            Text(
                                text = eff.uppercase(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSel) PrimaryNeonLight else TextPrimary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Font Size & Position Sliders
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Font Size: ${fontSize.toInt()}sp", style = MaterialTheme.typography.labelSmall)
                    Slider(
                        value = fontSize,
                        onValueChange = {
                            fontSize = it
                            onUpdateSettings(settings.copy(fontSizeSp = it))
                        },
                        valueRange = 18f..48f,
                        colors = SliderDefaults.colors(thumbColor = PrimaryNeon, activeTrackColor = PrimaryNeon)
                    )
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text("Vertical Position: ${posY.toInt()}%", style = MaterialTheme.typography.labelSmall)
                    Slider(
                        value = posY,
                        onValueChange = {
                            posY = it
                            onUpdateSettings(settings.copy(positionYPercent = it))
                        },
                        valueRange = 15f..90f,
                        colors = SliderDefaults.colors(thumbColor = AccentPink, activeTrackColor = AccentPink)
                    )
                }
            }

            // Dark Pill Background Toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Frosted Backdrop Pill", style = MaterialTheme.typography.labelMedium)
                Switch(
                    checked = hasPill,
                    onCheckedChange = {
                        hasPill = it
                        onUpdateSettings(settings.copy(bgPill = it))
                    },
                    colors = SwitchDefaults.colors(checkedThumbColor = PrimaryNeon, checkedTrackColor = PrimaryNeon.copy(alpha = 0.5f))
                )
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
                Text("Apply Typography", fontWeight = FontWeight.Bold)
            }
        }
    }
}
