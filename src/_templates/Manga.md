---
title: <% tp.file.cursor() %>
url: 
mangaCover: 
tags: 
- 
latestChapter:
lastReadDate: <% tp.date.now("YYYY-MM-DD") %>
status: <% await tp.system.suggester(["reading", "finished", "dropped"],["reading", "finished", "dropped"],true) %>
---
<% await tp.file.move("/src/content/manga/" + tp.file.title) %>
