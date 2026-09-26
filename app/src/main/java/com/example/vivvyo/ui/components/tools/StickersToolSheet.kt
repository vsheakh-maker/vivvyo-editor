package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.EmojiEmotions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vivvyo.data.SampleData
import com.example.vivvyo.model.StickerOverlayItem
import com.example.vivvyo.ui.theme.*

@Composable
fun StickersToolSheet(
    activeStickers: List<StickerOverlayItem>,
    onAddSticker: (String, String) -> Unit,
    onRemoveSticker: (String) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
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
                    Icon(imageVector = Icons.Default.EmojiEmotions, contentDescription = null, tint = AccentPink)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Viral Stickers & Retention Badges",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text("Tap to place over video canvas. Tap on canvas stickers to remove.", style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary))

            Spacer(modifier = Modifier.height(14.dp))

            // Sticker Grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(4),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
            ) {
                items(SampleData.TRENDING_STICKERS) { item ->
                    val isBadge = item.length > 2
                    Surface(
                        color = if (isBadge) AccentPink.copy(alpha = 0.2f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .height(48.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(
                                1.dp,
                                if (isBadge) AccentPink.copy(alpha = 0.5f) else StudioCardBorder,
                                RoundedCornerShape(10.dp)
                            )
                            .clickable {
                                onAddSticker(item, if (isBadge) "badge" else "emoji")
                            }
                            .testTag("sticker_$item")
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(4.dp)) {
                            Text(
                                text = item,
                                fontSize = if (isBadge) 10.sp else 24.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isBadge) AccentPink else TextPrimary,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
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
