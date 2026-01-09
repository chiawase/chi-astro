---
title: <% tp.file.cursor() %>
url: 
mangaCover: 
tags: 
- 
latestChapter:
status: <% await tp.system.suggester(["reading", "finished", "dropped"],["reading", "finished", "dropped"],true) %>
---
<% await tp.file.move("/src/content/manga/" + tp.file.title) %>
