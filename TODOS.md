#TODOs

[ ] - Create "message" type in the following shape:

```js
{
  role: "user" | "assistant" | "system",
  content: string
  timestamp: Date,
  generation_time: number
  tokens: number
}
```

[ ] - Conversation History Provider (we add all responses to history based on the shape above)
[ ] - Iterate through recent history to send as pre-pended context for the chat
[ ] - Save, change, update, manage system prompts
[ ] - Save output / transcripts
[ ] - Slash command "/copy" which will copy last message to the clipboard.
[ ] - OpenRouter as service / API
[ ] - Kobald as service / API
[ ] - Dropdown menu when typing slash commands
[ ] - Some slash commands show options. e.g., "/mode" will show options: "chat", "code", "architect"
[ ] - Show current cost of session for some models
[ ] - Show total cost of session for some models
[ ] - Handle if service not available or not selected (i.e., initial boot)

## For chats

[ ] - Save multiple chats (switch chats, manage chats)

## For coding

[ ] - Predefined command: /test
[ ] - Predefined command: /commit
[ ] - Predefined command: /revert
[ ] - Predefined command: /undo
