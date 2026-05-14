"""
VendorIQ — WebSocket API Routes
/ws/live-risk, /ws/alerts, /ws/events
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket_manager import manager

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/live-risk")
async def ws_live_risk(websocket: WebSocket):
    """WebSocket endpoint for live vendor risk score updates."""
    await manager.connect(websocket, "live-risk")
    try:
        while True:
            # Keep connection alive; server pushes data
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "live-risk")


@router.websocket("/ws/alerts")
async def ws_alerts(websocket: WebSocket):
    """WebSocket endpoint for live alert notifications."""
    await manager.connect(websocket, "alerts")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "alerts")


@router.websocket("/ws/events")
async def ws_events(websocket: WebSocket):
    """WebSocket endpoint for live event notifications."""
    await manager.connect(websocket, "events")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "events")
