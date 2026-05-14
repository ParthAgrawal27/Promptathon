"""
VendorIQ — WebSocket Connection Manager
Manages real-time connections for live risk updates, alerts, and events.
"""
import json
import logging
from datetime import datetime
from typing import Dict, List, Set
from fastapi import WebSocket

logger = logging.getLogger("vendoriq.websocket")


class ConnectionManager:
    """
    Manages WebSocket connections grouped by channel.
    Channels: 'live-risk', 'alerts', 'events'
    """

    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {
            "live-risk": [],
            "alerts": [],
            "events": [],
        }

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active:
            self.active[channel] = []
        self.active[channel].append(websocket)
        logger.info(f"WS connected: {channel} (total: {len(self.active[channel])})")

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active:
            self.active[channel] = [ws for ws in self.active[channel] if ws != websocket]
        logger.info(f"WS disconnected: {channel}")

    async def broadcast(self, channel: str, message: dict):
        """Broadcast a message to all connections in a channel."""
        if channel not in self.active:
            return
        payload = json.dumps(message, default=str)
        dead = []
        for ws in self.active[channel]:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, channel)

    async def broadcast_all(self, message: dict):
        """Broadcast to ALL channels."""
        for channel in self.active:
            await self.broadcast(channel, message)

    async def send_risk_update(self, vendor_data: dict):
        await self.broadcast("live-risk", {
            "type": "risk_update",
            "data": vendor_data,
            "timestamp": datetime.utcnow().isoformat(),
        })

    async def send_alert(self, alert_data: dict):
        await self.broadcast("alerts", {
            "type": "alert",
            "data": alert_data,
            "timestamp": datetime.utcnow().isoformat(),
        })

    async def send_event(self, event_data: dict):
        await self.broadcast("events", {
            "type": "event",
            "data": event_data,
            "timestamp": datetime.utcnow().isoformat(),
        })

    async def send_dashboard_refresh(self):
        await self.broadcast_all({
            "type": "dashboard_refresh",
            "data": {"action": "refresh"},
            "timestamp": datetime.utcnow().isoformat(),
        })

    @property
    def connection_count(self) -> int:
        return sum(len(conns) for conns in self.active.values())


# Singleton instance
manager = ConnectionManager()
