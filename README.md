DEFAULT BOT COMMAND PREFIX: ~  
  
REQUIREMENTS: basic knowledge on npm  
  
1. create a bot account  
<https://discord.com/developers/applications/>  
create a new application -> this will create a token that will be used after  
the token looks like this: XXXxxXxXxXxXXxXXXXxx.XxXXXx.XXxxXxXxXXxXXXxXxxX (random letters instead of Xs)  
<http://prntscr.com/se6nud>  
this token may not be shared, because it is like a password to run the bot, so other people with this token can hack it  
it is like a key to stream on youtube or twitch  
  
2. install node.js  
<https://nodejs.org/en/download/>  
  
3. install dependencies  
npm install discord.js  
<https://www.npmjs.com/package/discord.js>  
npm install cheerio  
<https://www.npmjs.com/package/cheerio>  
  
4. start npm inside folder  
open console (cmd)  
run "npm init" inside a desired folder  
  
5. setup this files into the project  
put those two files "index.js e botsettings.json" into that folder, at the same level as "package.json"  
change "YOUR_TOKEN" in botsettings.json to the token in the step 1  
  
6. run  
you can use the cmd using the command: node index  
or run it in a clickable way using a .bat file with "node index" as its content  
