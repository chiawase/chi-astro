---
title: <% tp.file.cursor() %>
url: 
platform: <% await tp.system.suggester(["Steam", "PS5", "Xbox"], ["Steam", "PS5", "Xbox"], true) %>
gameImage: 
tags: 
- 
startedPlayingDate: <% tp.date.now("YYYY-MM-DD") %>
lastPlayedDate:
status: <% await tp.system.suggester(["completed", "playing", "paused", "dropped"],["completed", "playing", "paused", "dropped"],true) %>
pubDate: 2026-01-04T10:31:01+00:00
updatedDate: 2026-01-04T10:44:58+00:00
---
<% await tp.file.move("/src/content/games/" + tp.file.title) %>
