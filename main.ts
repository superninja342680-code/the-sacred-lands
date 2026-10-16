
namespace SpriteKind {
    export const Sword = SpriteKind.create()
    export const Boss = SpriteKind.create()
    export const Key = SpriteKind.create()
    export const Door = SpriteKind.create()
}

let hero: Sprite = null
let sword: Sprite = null
let bossHP = 0
let dungeonLevel = 1
let enemiesRemaining = 0
let keys = 0
let facing = 1
let invincible = false

hero = sprites.create(img`
    . . 5 5 5 . .
    . 5 2 2 2 5 .
    . 5 2 2 2 5 .
    . . 5 5 5 . .
    . 5 4 4 4 5 .
    5 4 4 4 4 4 5
    . 5 4 4 4 5 .
    . . 5 . 5 . .
`, SpriteKind.Player)

controller.moveSprite(hero, 100, 100)

scene.cameraFollowSprite(hero)

info.setLife(5)
info.setScore(0)

function loadDungeon() {

    for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
        e.destroy()
    }

    for (let b of sprites.allOfKind(SpriteKind.Boss)) {
        b.destroy()
    }

    for (let d of sprites.allOfKind(SpriteKind.Door)) {
        d.destroy()
    }

    enemiesRemaining = 0

    hero.setPosition(80, 60)

    scene.setBackgroundColor(dungeonLevel)

    if (dungeonLevel == 1) {

        for (let i = 0; i < 4; i++) {
            let slime = sprites.create(img`
                . 6 6 6 .
                6 8 8 8 6
                6 8 8 8 6
                . 6 6 6 .
            `, SpriteKind.Enemy)

            slime.setPosition(randint(20, 140), randint(20, 100))
            slime.follow(hero, 20)

            enemiesRemaining += 1
        }

    } else if (dungeonLevel == 2) {

        for (let i = 0; i < 6; i++) {
            let bat = sprites.create(img`
                . 2 . 2 .
                2 2 2 2 2
                . 2 2 2 .
            `, SpriteKind.Enemy)

            bat.setPosition(randint(20, 140), randint(20, 100))
            bat.follow(hero, 40)

            enemiesRemaining += 1
        }

    } else if (dungeonLevel == 3) {

        for (let i = 0; i < 8; i++) {
            let ghost = sprites.create(img`
                . 1 1 1 .
                1 9 9 9 1
                1 9 1 9 1
                . 1 1 1 .
            `, SpriteKind.Enemy)

            ghost.setPosition(randint(20, 140), randint(20, 100))
            ghost.follow(hero, 50)

            enemiesRemaining += 1
        }

    } else {

        for (let i = 0; i < 10; i++) {
            let knight = sprites.create(img`
                . 5 5 5 .
                5 8 8 8 5
                5 8 5 8 5
                . 5 5 5 .
            `, SpriteKind.Enemy)

            knight.setPosition(randint(20, 140), randint(20, 100))
            knight.follow(hero, 30)

            enemiesRemaining += 1
        }

    }
}

function spawnBoss() {

    let boss = sprites.create(img`
        8 8 8 8 8
        8 2 2 2 8
        8 2 8 2 8
        8 2 2 2 8
        8 8 8 8 8
    `, SpriteKind.Boss)

    boss.setScale(2)

    boss.setPosition(80, 20)

    boss.follow(hero, 25)

    bossHP = dungeonLevel * 10
}

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {

    sword = sprites.create(img`
        1
        1
        1
        1
    `, SpriteKind.Sword)

    if (facing == 1) {
        sword.setPosition(hero.x + 12, hero.y)
    } else if (facing == 2) {
        sword.setPosition(hero.x - 12, hero.y)
    } else if (facing == 3) {
        sword.setPosition(hero.x, hero.y - 12)
    } else {
        sword.setPosition(hero.x, hero.y + 12)
    }

    sword.lifespan = 150
})

game.onUpdate(function () {

    if (controller.right.isPressed()) {
        facing = 1
    } else if (controller.left.isPressed()) {
        facing = 2
    } else if (controller.up.isPressed()) {
        facing = 3
    } else if (controller.down.isPressed()) {
        facing = 4
    }
})

sprites.onOverlap(SpriteKind.Sword, SpriteKind.Enemy, function (sword, enemy) {

    sword.destroy()

    enemy.destroy(effects.disintegrate, 100)

    enemiesRemaining -= 1

    info.changeScoreBy(1)

    if (enemiesRemaining <= 0) {
        spawnBoss()
    }
})

sprites.onOverlap(SpriteKind.Sword, SpriteKind.Boss, function (sword, boss) {

    sword.destroy()

    bossHP -= 1

    if (bossHP <= 0) {

        boss.destroy(effects.fire, 500)

        let key = sprites.create(img`
            . . 5 5 . .
            . 5 5 5 5 .
            . . 5 5 . .
            . . 5 . . .
            5 5 5 5 . .
            . . 5 . . .
        `, SpriteKind.Key)

        key.setPosition(80, 60)

        let door = sprites.create(img`
            4 4 4 4
            4 2 2 4
            4 2 2 4
            4 4 4 4
        `, SpriteKind.Door)

        door.setPosition(140, 60)
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Key, function (player, key) {

    key.destroy()

    keys += 1

    hero.sayText("Key!", 500)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Door, function (player, door) {

    if (keys <= 0) {
        hero.sayText("Locked", 500)
        return
    }

    keys -= 1

    door.destroy()

    dungeonLevel += 1

    if (dungeonLevel > 4) {

        game.over(true, effects.confetti)

    } else {

        loadDungeon()
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (player, enemy) {

    if (invincible) return

    invincible = true

    info.changeLifeBy(-1)

    pause(1000)

    invincible = false
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Boss, function (player, boss) {

    if (invincible) return

    invincible = true

    info.changeLifeBy(-1)

    pause(1000)

    invincible = false
})

info.onLifeZero(function () {

    game.over(false, effects.melt)
})
game.splash(
    "The Sacred Lands",
    "A Zelda-Style Adventure"
)

game.showLongText(
    "The Sacred Lands are in danger. Evil monsters have risen from the ancient dungeons. Defeat the dungeon bosses, find the sacred keys, unlock the doors, and save the kingdom!",
    DialogLayout.Full
)

game.showLongText(
    "Controls:\n\nMove = D-Pad\nAttack = A Button\n\nDefeat enemies.\nDefeat bosses.\nCollect keys.\nOpen locked doors.\nSave The Sacred Lands!",
    DialogLayout.Full
)

game.splash(
    "Good Luck, Hero!"
)
loadDungeon()
