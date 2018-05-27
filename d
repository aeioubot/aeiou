[33mcommit cda41f00205c14f5958d323aa7f7d924dc3c12bd[m
Author: dmbutalsodm <Kuwar.nagpal@gmail.com>
Date:   Thu May 3 11:01:24 2018 -0400

    Cr list now uses existing class

[1mdiff --git a/commands/cr/creact.js b/commands/cr/creact.js[m
[1mindex b33f49d..03e373e 100644[m
[1m--- a/commands/cr/creact.js[m
[1m+++ b/commands/cr/creact.js[m
[36m@@ -86,7 +86,8 @@[m [mmodule.exports = class CReactCommand extends Command {[m
 				}).then(msg.say(`Reaction deleted, I'll no longer respond to **${trigger}**.`));[m
 			}[m
 			case 'list': { // Lists the triggers in the guild.[m
[31m-				return this.client.registry.commands.get('crlist').run(msg, {trigger: trigger});[m
[32m+[m				[32mconsole.log(trigger);[m
[32m+[m				[32mreturn this.client.registry.commands.get('crlist').run(msg, {argPage: trigger});[m
 			}[m
 			default: msg.say('That isn\'t a valid option.'); break;[m
 		}[m
