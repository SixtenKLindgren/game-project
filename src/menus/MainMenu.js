import Menu from './Menu.js'
import ControlsMenu from './ControlsMenu.js'

export default class MainMenu extends Menu {
    constructor(game) {
        super(game)
        this.solidBackground = true
    }

    getTitle() {
        return 'SQUARE KILLER'
    }
    
    getOptions() {
        return [
            {
                text: 'Start Game',
                action: () => {
                    this.game.restart()
                    this.game.inputHandler.keys.clear()
                }
            },
            {
                text: 'Controls',
                action: () => {
                    this.game.currentMenu = new ControlsMenu(this.game)
                }
            }
        ]
    }

    draw(ctx) {
        // 1. Draw the background and text first (so it's the bottom layer)
        super.draw(ctx);

        // 2. Draw the image on TOP of the background
        if (this.game.menuImage.complete) {
            const img = this.game.menuImage;
            const displayHeight = this.game.canvas.height * 0.5;
            
            // Correct the typo 'widht' to 'width' here
            const aspectRatio = img.width / img.height; 
            const displayWidth = displayHeight * aspectRatio;

            const x = 50;
            const y = (this.game.canvas.height - displayHeight) / 2;

            ctx.drawImage(img, x, y, displayWidth, displayHeight);
        }
}
}
