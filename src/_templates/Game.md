---
title: <% tp.file.cursor() %>
url: 
platform: <% await tp.system.suggester(["steam", "playstation", "xbox"], ["steam", "playstation", "xbox"], true) %>
gameImage: 
tags: 
- 
startedPlayingDate: <% tp.date.now("YYYY-MM-DD") %>
lastPlayedDate:
status: <% await tp.system.suggester(["completed", "playing", "paused", "dropped"],["completed", "playing", "paused", "dropped"],true) %>
---
<% await tp.file.move("/src/content/games/" + tp.file.title) %>
