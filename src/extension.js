const vscode = require("vscode");
const player = require("play-sound")();

const gitExtension = vscode.extensions.getExtension("vscode.git").exports;
const git = gitExtension.getAPI(1);

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log("Foul Tarnished!");
    const repo = git.repositories[0];

    let ahead = 0;
    if (repo && repo.state && repo.state.HEAD && repo.state.HEAD.ahead)
        ahead = repo.state.HEAD.ahead;

    // Commit
    repo.onDidCommit(() => {
        if (!repo || !repo.state || !repo.state.HEAD) return;

        showMessage(context, "CHANGE COMMITTED", "goldenrod", "save");
    });

    // Checkout
    repo.onDidCheckout(() => {
        if (!repo || !repo.state || !repo.state.HEAD) return;

        showMessage(context, repo.state.HEAD.name, "white", "info");
    });

    // Push
    repo.state.onDidChange(() => {
        if (!repo || !repo.state || !repo.state.HEAD) return;

        const latest = repo.state.HEAD.ahead ?? 0;
        if (ahead > 0 && latest == 0) {
            showMessage(context, "COMMIT PUSHED", "goldenrod", "success");
        }
        ahead = latest;
    });
}

/**
 * @param {vscode.ExtensionContext} context
 */
function showMessage(context, message, color, sound) {
    player.play(context.asAbsolutePath(`assets/${sound}.wav`), function (err) {
        if (err) throw err;
    });

    const panel = vscode.window.createWebviewPanel(
        "eldenRingMessage",
        message,
        vscode.ViewColumn.One,
        {
            localResourceRoots: [
                vscode.Uri.joinPath(context.extensionUri, "assets"),
            ],
        },
    );

    panel.webview.html = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style>
					body {
						background: transparent;
						margin: 0;
						padding: 0;
					}
					h1 {
						position: absolute;
						transform: translateY(-50%);
						top: 50%;
						width: 100%;
						background: linear-gradient(to bottom, transparent, black 30% 70%, transparent);
						padding: 40px 0;
						margin: 0;
						text-align: center;
						color: ${color};
						font-size: 69px;
						font-family: 'Times New Roman', serif;
						font-weight: 400;
						animation: message-appear 8s both;
					}
					.back-text {
						animation: back-text-appear 8s both;
					}
					@keyframes message-appear {
						from {
							opacity: 0;
						}
						to {
							opacity: 0.8;
						}
					}
					@keyframes back-text-appear {
						from {
							letter-spacing: 1px;
							opacity: 0;
						}
						to {
							opacity: 0.5;
							letter-spacing: 8px;
						}
					}
				</style>
			</head>
			<body>
				${sound == "success" || sound == "save" ? `<H1 class="back-text">${message}</H1>` : ``}
				<H1>${message}</H1>
			</body>
		</html>
	`;

    setTimeout(function () {
        panel.dispose();
    }, 8000);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
