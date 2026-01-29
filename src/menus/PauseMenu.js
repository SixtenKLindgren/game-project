import Menu from './Menu.js'
import MainMenu from './MainMenu.js'

export default class PauseMenu extends Menu {
    getTitle() {
        return 'Game Paused'
    }

    getOptions() {
        return [
            {
                text: 'Resume',
                action: () => {
                    this.game.gameState = 'PLAYING'
                    this.game.currentMenu = null
                    this.game.inputHandler.keys.clear()
                }
            },
            {
                text: 'Restart',
                action: () => {
                    this.game.restart()
                    this.game.currentMenu = null
                }
            },
            {
                text: 'Return to Main Menu',
                action: () => {
                    this.game.currentMenu = new MainMenu(this.game)
                    this.game.gameState = 'MENU'
                    this.game.inputHandler.keys.clear()
                }
            }
        ]
    }
}