/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2017
 * @compiler Bridge.NET 17.1.0
 */
Bridge.assembly("WordWoop", function ($asm, globals) {
    "use strict";

    Bridge.define("WordWoop.AbstractGameState", {
        inherits: [Phaser.State],
        methods: {
            preload: function () { },
            create: function () { },
            update: function () { },
            render: function () { }
        }
    });

    Bridge.define("WordWoop.App", {
        main: function Main () {
            WordWoop.App.StartGame();
        },
        statics: {
            fields: {
                _game: null,
                _isRun: false
            },
            methods: {
                StartGame: function () {
                    if (WordWoop.App._isRun) {
                        WordWoop.App._game.destroy();
                        WordWoop.App._game = null;
                        WordWoop.App._isRun = false;
                    }

                    WordWoop.App._game = new Phaser.Game(800, 600, Phaser.AUTO, "phaserRoot", new WordWoop.WordWoopGame());
                    WordWoop.App._isRun = true;
                }
            }
        }
    });

    Bridge.define("WordWoop.Core.Board", {
        fields: {
            letters: null,
            slots: null
        },
        ctors: {
            ctor: function (letters, slots) {
                this.$initialize();
                this.letters = letters;
                this.slots = slots;
            }
        },
        methods: {
            IsWon: function () {
                var answers = this.GetWords();
                return (Bridge.referenceEquals(answers.getItem(0), "CAT") && Bridge.referenceEquals(answers.getItem(1), "MAT"));
            },
            GetCurrentSlot: function (letter) {
                return System.Linq.Enumerable.from(this.slots).firstOrDefault(function (x) {
                        return Bridge.referenceEquals(x.Letter, letter);
                    }, null);
            },
            LetterDropped: function (x, y, letter) {
                var toSlot = System.Linq.Enumerable.from(this.slots).firstOrDefault(Bridge.fn.bind(this, function (s) {
                        return this.IsOnSlot(x, y, s.Sprite);
                    }), null);

                if (toSlot == null) {
                    this.SnapBackLetter(letter);
                    return;
                }

                if (toSlot.HasLetter()) {
                    this.ClearSpace(toSlot);
                    this.AddLetterToSlot(letter, toSlot);
                } else {
                    this.AddLetterToSlot(letter, toSlot);
                }
            },
            ClearSpace: function (toSlot) {
                if (this.CanShuntDown(toSlot)) {
                    this.ShuntDown(toSlot);
                }

            },
            CanShuntDown: function (toSlot) {
                for (var i = 0; i < this.slots.Count; i = (i + 1) | 0) {
                    if (Bridge.referenceEquals(toSlot, this.slots.getItem(i))) {
                        var nextIndex = (i + 1) | 0;
                        if (nextIndex >= this.slots.Count) {
                            return false;
                        }
                    }
                }
                return true;
            },
            ShuntDown: function (toSlot) {
                var nextSlot = null;

                for (var i = 0; i < this.slots.Count; i = (i + 1) | 0) {
                    if (Bridge.referenceEquals(toSlot, this.slots.getItem(i))) {
                        var nextIndex = (i + 1) | 0;
                        if (nextIndex >= this.slots.Count) {
                            nextIndex = 0;
                        }
                        nextSlot = this.slots.getItem(nextIndex);
                    }
                }
                this.AddLetterToSlot(toSlot.Letter, nextSlot);
            },
            SnapBackLetter: function (letter) {
                var fromSlot = this.GetCurrentSlot(letter);
                letter.Sprite.WordWoop$Core$ISprite$x = fromSlot.Sprite.WordWoop$Core$ISprite$x + (letter.Sprite.WordWoop$Core$ISprite$anchorX * fromSlot.Sprite.WordWoop$Core$ISprite$width);
                letter.Sprite.WordWoop$Core$ISprite$y = fromSlot.Sprite.WordWoop$Core$ISprite$y + (letter.Sprite.WordWoop$Core$ISprite$anchorY * fromSlot.Sprite.WordWoop$Core$ISprite$height);
            },
            PutLetterOnSlotInitially: function (letter, toSlot) {
                letter.Sprite.WordWoop$Core$ISprite$x = toSlot.Sprite.WordWoop$Core$ISprite$x + (letter.Sprite.WordWoop$Core$ISprite$anchorX * toSlot.Sprite.WordWoop$Core$ISprite$width);
                letter.Sprite.WordWoop$Core$ISprite$y = toSlot.Sprite.WordWoop$Core$ISprite$y + (letter.Sprite.WordWoop$Core$ISprite$anchorY * toSlot.Sprite.WordWoop$Core$ISprite$height);

                toSlot.DropLetter(letter);
            },
            AddLetterToSlot: function (letter, toSlot) {
                letter.Sprite.WordWoop$Core$ISprite$x = toSlot.Sprite.WordWoop$Core$ISprite$x + (letter.Sprite.WordWoop$Core$ISprite$anchorX * toSlot.Sprite.WordWoop$Core$ISprite$width);
                letter.Sprite.WordWoop$Core$ISprite$y = toSlot.Sprite.WordWoop$Core$ISprite$y + (letter.Sprite.WordWoop$Core$ISprite$anchorY * toSlot.Sprite.WordWoop$Core$ISprite$height);

                var fromSlot = this.GetCurrentSlot(letter);
                fromSlot.TakeLetter();
                toSlot.DropLetter(letter);
            },
            GetWords: function () {
                var word1 = [this.slots.getItem(5).GetLetterValue(), this.slots.getItem(6).GetLetterValue(), this.slots.getItem(7).GetLetterValue()].join("");
                var word2 = [this.slots.getItem(8).GetLetterValue(), this.slots.getItem(6).GetLetterValue(), this.slots.getItem(9).GetLetterValue()].join("");
                return function (_o1) {
                        _o1.add(word1);
                        _o1.add(word2);
                        return _o1;
                    }(new (System.Collections.Generic.List$1(System.String)).ctor());
            },
            IsOnSlot: function (x, y, sprite) {
                if (x >= sprite.WordWoop$Core$ISprite$x && x <= (sprite.WordWoop$Core$ISprite$x + sprite.WordWoop$Core$ISprite$width) && y >= sprite.WordWoop$Core$ISprite$y && y <= (sprite.WordWoop$Core$ISprite$y + sprite.WordWoop$Core$ISprite$height)) {
                    return true;
                }

                return false;
            }
        }
    });

    Bridge.define("WordWoop.Core.BoardBuilder", {
        methods: {
            Build: function (letterBuilder, slotBuilder) {
                var slots = function (_o1) {
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(0, 0, 100));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(120, 0, 100));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(240, 0, 100));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(360, 0, 100));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(480, 0, 100));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(0, 240, 100));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(120, 240, 100));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(240, 240, 100));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(120, 120, 100));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(120, 360, 100));
                        return _o1;
                    }(new (System.Collections.Generic.List$1(WordWoop.Core.Slot)).ctor());
                var letters = function (_o2) {
                        _o2.add(letterBuilder.WordWoop$Core$ILetterBuilder$Build("C", 0, 0));
                        _o2.add(letterBuilder.WordWoop$Core$ILetterBuilder$Build("A", 0, 0));
                        _o2.add(letterBuilder.WordWoop$Core$ILetterBuilder$Build("T", 0, 0));
                        _o2.add(letterBuilder.WordWoop$Core$ILetterBuilder$Build("M", 0, 0));
                        _o2.add(letterBuilder.WordWoop$Core$ILetterBuilder$Build("T", 0, 0));
                        return _o2;
                    }(new (System.Collections.Generic.List$1(WordWoop.Core.Letter)).ctor());

                var board = new WordWoop.Core.Board(letters, slots);

                for (var i = 0; i < System.Linq.Enumerable.from(letters).count(); i = (i + 1) | 0) {
                    board.PutLetterOnSlotInitially(letters.getItem(i), slots.getItem(i));
                }

                return board;
            }
        }
    });

    Bridge.define("WordWoop.Core.ILetterBuilder", {
        $kind: "interface"
    });

    Bridge.define("WordWoop.Core.ISlotBuilder", {
        $kind: "interface"
    });

    Bridge.define("WordWoop.Core.ISprite", {
        $kind: "interface"
    });

    Bridge.define("WordWoop.Core.Letter", {
        fields: {
            Sprite: null,
            LetterValue: null
        },
        ctors: {
            ctor: function (sprite, letterValue) {
                this.$initialize();
                this.Sprite = sprite;
                this.LetterValue = letterValue;
            }
        }
    });

    Bridge.define("WordWoop.Core.Slot", {
        fields: {
            Sprite: null,
            Letter: null
        },
        ctors: {
            ctor: function (sprite) {
                this.$initialize();
                this.Sprite = sprite;
            }
        },
        methods: {
            DropLetter: function (letter) {
                this.Letter = letter;
            },
            TakeLetter: function () {
                this.Letter = null;
            },
            GetLetterValue: function () {
                if (this.Letter == null) {
                    return "_";
                }

                return this.Letter.LetterValue;
            },
            HasLetter: function () {
                return this.Letter != null;
            }
        }
    });

    Bridge.define("WordWoop.SquareDrawer", {
        methods: {
            Draw: function (graphics, borderColour, fillColour, width) {
                graphics.clear();

                graphics.beginFill(fillColour);
                graphics.lineStyle(2, borderColour, 1);

                graphics.moveTo(0, 0);
                graphics.lineTo(width, 0);
                graphics.lineTo(width, width);
                graphics.lineTo(0, width);
                graphics.lineTo(0, 0);

                graphics.endFill();
            }
        }
    });

    Bridge.define("WordWoop.LetterBuilder", {
        inherits: [WordWoop.Core.ILetterBuilder],
        fields: {
            game: null,
            squareDrawer: null
        },
        alias: ["Build", "WordWoop$Core$ILetterBuilder$Build"],
        ctors: {
            ctor: function (game, squareDrawer) {
                this.$initialize();
                this.game = game;
                this.squareDrawer = squareDrawer;
            }
        },
        methods: {
            Build: function (letter, x, y) {
                var graphics = this.game.add.graphics(0, 0);

                this.squareDrawer.Draw(graphics, 255, 13421823, 90);

                var text = this.game.add.text(0, 0, letter, { font: "34px Arial", fill: "#fff" });
                text.anchor.set(0.5);
                var sprite = this.game.add.sprite(x, y, graphics.generateTexture());
                sprite.anchor.set(0.5);
                sprite.addChild(text);

                sprite.inputEnabled = true;
                sprite.input.enableDrag(true);

                graphics.destroy();

                return new WordWoop.Core.Letter(new WordWoop.SpriteWrapper(sprite), letter);
            }
        }
    });

    Bridge.define("WordWoop.SlotBuilder", {
        inherits: [WordWoop.Core.ISlotBuilder],
        fields: {
            game: null,
            squareDrawer: null
        },
        alias: ["Build", "WordWoop$Core$ISlotBuilder$Build"],
        ctors: {
            ctor: function (game, squareDrawer) {
                this.$initialize();
                this.game = game;
                this.squareDrawer = squareDrawer;
            }
        },
        methods: {
            Build: function (x, y, width) {
                var graphics = this.game.add.graphics(0, 0);
                this.squareDrawer.Draw(graphics, 16777215, 0, width);
                var sprite = this.game.add.sprite(x, y, graphics.generateTexture());
                graphics.destroy();
                return new WordWoop.Core.Slot(new WordWoop.SpriteWrapper(sprite));
            }
        }
    });

    Bridge.define("WordWoop.SpriteWrapper", {
        inherits: [WordWoop.Core.ISprite],
        fields: {
            Sprite: null
        },
        props: {
            x: {
                get: function () {
                    return this.Sprite.x;
                },
                set: function (value) {
                    this.Sprite.x = value;
                }
            },
            y: {
                get: function () {
                    return this.Sprite.y;
                },
                set: function (value) {
                    this.Sprite.y = value;
                }
            },
            width: {
                get: function () {
                    return this.Sprite.width;
                },
                set: function (value) {
                    this.Sprite.width = value;
                }
            },
            height: {
                get: function () {
                    return this.Sprite.height;
                },
                set: function (value) {
                    this.Sprite.height = value;
                }
            },
            anchorX: {
                get: function () {
                    return this.Sprite.anchor.x;
                },
                set: function (value) {
                    this.Sprite.anchor.x = value;
                }
            },
            anchorY: {
                get: function () {
                    return this.Sprite.anchor.y;
                },
                set: function (value) {
                    this.Sprite.anchor.y = value;
                }
            }
        },
        alias: [
            "x", "WordWoop$Core$ISprite$x",
            "y", "WordWoop$Core$ISprite$y",
            "width", "WordWoop$Core$ISprite$width",
            "height", "WordWoop$Core$ISprite$height",
            "anchorX", "WordWoop$Core$ISprite$anchorX",
            "anchorY", "WordWoop$Core$ISprite$anchorY"
        ],
        ctors: {
            ctor: function (sprite) {
                this.$initialize();
                this.Sprite = sprite;
            }
        }
    });

    Bridge.define("WordWoop.WordWoopGame", {
        inherits: [WordWoop.AbstractGameState],
        fields: {
            graphics: null,
            board: null,
            winText: null,
            debugText: null
        },
        methods: {
            preload: function () {
                this.game.load.crossOrigin = true;
                this.game.stage.backgroundColor = "#4488AA";
            },
            create: function () {
                var boardBuilder = new WordWoop.Core.BoardBuilder();
                var squareDrawer = new WordWoop.SquareDrawer();
                var letterBuilder = new WordWoop.LetterBuilder(this.game, squareDrawer);
                var slotBuilder = new WordWoop.SlotBuilder(this.game, squareDrawer);
                this.board = boardBuilder.Build(letterBuilder, slotBuilder);

                this.board.letters.ForEach(Bridge.fn.bind(this, function (x) {
                    var sw = Bridge.as(x.Sprite, WordWoop.SpriteWrapper);
                    sw.Sprite.events.onDragStart.add(function () {
                        return sw.Sprite.bringToTop();
                    });
                    sw.Sprite.events.onDragStop.add(Bridge.fn.bind(this, function () {
                        this.Dropped(x);
                    }), this);
                }));
                this.winText = this.game.add.text(600, 0, "WIN!", { font: "34px Arial", fill: "#fff" });
                this.debugText = this.game.add.text(0, 580, "DEBUG", { font: "10px Arial", fill: "#fff" });
            },
            Dropped: function (letter) {
                var pointer = this.game.input.activePointer;
                this.board.LetterDropped(pointer.x, pointer.y, letter);
            },
            update: function () { },
            render: function () {
                var answers = this.board.GetWords();
                this.debugText.text = System.String.format("Answers: {0}|{1}", answers.getItem(0), answers.getItem(1));

                if (this.board.IsWon()) {
                    this.winText.visible = true;
                } else {
                    this.winText.visible = false;
                }
            },
            Restart: function () {

            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJXb3JkV29vcC5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiQXBwLmNzIiwiQ29yZS9Cb2FyZC5jcyIsIkNvcmUvQm9hcmRCdWlsZGVyLmNzIiwiQ29yZS9MZXR0ZXIuY3MiLCJDb3JlL1Nsb3QuY3MiLCJTcXVhcmVEcmF3ZXIuY3MiLCJMZXR0ZXJCdWlsZGVyLmNzIiwiU2xvdEJ1aWxkZXIuY3MiLCJTcHJpdGVXcmFwcGVyLmNzIiwiV29yZFdvb3BHYW1lLmNzIl0sCiAgIm5hbWVzIjogWyIiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQVVZQTs7Ozs7Ozs7O29CQUtBQSxJQUFJQTt3QkFFQUE7d0JBQ0FBLHFCQUFRQTt3QkFDUkE7OztvQkFHSkEscUJBQVFBLElBQUlBLHNCQUFxQ0EsMkJBQTBDQSxJQUFJQTtvQkFDL0ZBOzs7Ozs7Ozs7Ozs7NEJDWlNBLFNBQ0xBOztnQkFFSkEsZUFBZUE7Z0JBQ2ZBLGFBQWFBOzs7OztnQkFLYkEsY0FBY0E7Z0JBQ2RBLE9BQU9BLENBQUNBLHFEQUF1QkE7O3NDQUdSQTtnQkFFdkJBLE9BQU9BLDRCQUFrRUEsMkJBQU1BLEFBQXdEQTsrQkFBS0EsaUNBQVlBOzs7cUNBR2xJQSxHQUFVQSxHQUFVQTtnQkFFMUNBLGFBQWFBLDRCQUFrRUEsMkJBQVdBLEFBQXdEQTsrQkFBS0EsY0FBU0EsR0FBR0EsR0FBR0E7OztnQkFFdEtBLElBQUlBLFVBQVVBO29CQUVWQSxvQkFBZUE7b0JBQ2ZBOzs7Z0JBR0pBLElBQUlBO29CQUVBQSxnQkFBZ0JBO29CQUNoQkEscUJBQXFCQSxRQUFRQTs7b0JBSTdCQSxxQkFBcUJBLFFBQVFBOzs7a0NBSWJBO2dCQUVwQkEsSUFBSUEsa0JBQWFBO29CQUNiQSxlQUFVQTs7OztvQ0FnQlFBO2dCQUV0QkEsS0FBS0EsV0FBV0EsSUFBSUEsa0JBQWtCQTtvQkFFbENBLElBQUlBLCtCQUFVQSxtQkFBV0E7d0JBRXJCQSxnQkFBZ0JBO3dCQUNo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QkFHM0JBO2dCQUVoQkEsY0FBY0E7Z0JBQ2RBLHlCQUFvQkEsV0FBV0EsV0FBV0E7Ozs7Z0JBUzFDQSxjQUFjQTtnQkFDZEEsc0JBQWlCQSx5Q0FBaUNBLG9CQUFXQTs7Z0JBRTdEQSxJQUFJQTtvQkFDQUE7O29CQUVBQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJcclxubmFtZXNwYWNlIFdvcmRXb29wXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBBcHBcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSBfZ2FtZTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIF9pc1J1bjtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIE1haW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU3RhcnRHYW1lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgU3RhcnRHYW1lKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChfaXNSdW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIF9nYW1lLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIF9nYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIF9pc1J1biA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfZ2FtZSA9IG5ldyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSg4MDAsIDYwMCwgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkFVVE8sIFwicGhhc2VyUm9vdFwiLCBuZXcgV29yZFdvb3BHYW1lKCkpO1xyXG4gICAgICAgICAgICBfaXNSdW4gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG5cclxubmFtZXNwYWNlIFdvcmRXb29wLkNvcmVcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEJvYXJkXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIExpc3Q8TGV0dGVyPiBsZXR0ZXJzO1xyXG4gICAgICAgIHB1YmxpYyBMaXN0PFNsb3Q+IHNsb3RzO1xyXG5cclxuICAgICAgICBwdWJsaWMgQm9hcmQoTGlzdDxMZXR0ZXI+IGxldHRlcnMsXHJcbiAgICAgICAgICAgICAgICBMaXN0PFNsb3Q+IHNsb3RzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZXR0ZXJzID0gbGV0dGVycztcclxuICAgICAgICAgICAgdGhpcy5zbG90cyA9IHNsb3RzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGJvb2wgSXNXb24oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGFuc3dlcnMgPSB0aGlzLkdldFdvcmRzKCk7XHJcbiAgICAgICAgICAgIHJldHVybiAoYW5zd2Vyc1swXSA9PSBcIkNBVFwiICYmIGFuc3dlcnNbMV0gPT0gXCJNQVRcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgU2xvdCBHZXRDdXJyZW50U2xvdChMZXR0ZXIgbGV0dGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuRmlyc3RPckRlZmF1bHQ8Z2xvYmFsOjpXb3JkV29vcC5Db3JlLlNsb3Q+KHNsb3RzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6V29yZFdvb3AuQ29yZS5TbG90LCBib29sPikoeCA9PiB4LkxldHRlciA9PSBsZXR0ZXIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIExldHRlckRyb3BwZWQoZG91YmxlIHgsIGRvdWJsZSB5LCBMZXR0ZXIgbGV0dGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHRvU2xvdCA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuRmlyc3RPckRlZmF1bHQ8Z2xvYmFsOjpXb3JkV29vcC5Db3JlLlNsb3Q+KHRoaXMuc2xvdHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpXb3JkV29vcC5Db3JlLlNsb3QsIGJvb2w+KShzID0+IElzT25TbG90KHgsIHksIHMuU3ByaXRlKSkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRvU2xvdCA9PSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBTbmFwQmFja0xldHRlcihsZXR0ZXIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodG9TbG90Lkhhc0xldHRlcigpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkNsZWFyU3BhY2UodG9TbG90KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuQWRkTGV0dGVyVG9TbG90KGxldHRlciwgdG9TbG90KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuQWRkTGV0dGVyVG9TbG90KGxldHRlciwgdG9TbG90KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIENsZWFyU3BhY2UoU2xvdCB0b1Nsb3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoQ2FuU2h1bnREb3duKHRvU2xvdCkpXHJcbiAgICAgICAgICAgICAgICBTaHVudERvd24odG9TbG90KTtcclxuXHJcbiAgICAgICAgICAgIC8vU2xvdCBuZXh0U2xvdCA9IG51bGw7XHJcbiAgICAgICAgICAgIC8vZm9yICh2YXIgaT0wOyBpPHRoaXMuc2xvdHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAgLy97XHJcbiAgICAgICAgICAgIC8vICAgIGlmICh0b1Nsb3QgPT0gdGhpcy5zbG90c1tpXSlcclxuICAgICAgICAgICAgLy8gICAge1xyXG4gICAgICAgICAgICAvLyAgICAgICAgdmFyIG5leHRJbmRleCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAvLyAgICAgICAgaWYgKG5leHRJbmRleCA+PSB0aGlzLnNsb3RzLkNvdW50KVxyXG4gICAgICAgICAgICAvLyAgICAgICAgICAgIG5leHRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIC8vICAgICAgICBuZXh0U2xvdCA9IHRoaXMuc2xvdHNbbmV4dEluZGV4XTtcclxuICAgICAgICAgICAgLy8gICAgfVxyXG4gICAgICAgICAgICAvL31cclxuICAgICAgICAgICAgLy90aGlzLkFkZExldHRlclRvU2xvdCh0b1Nsb3QuTGV0dGVyLCBuZXh0U2xvdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGJvb2wgQ2FuU2h1bnREb3duKFNsb3QgdG9TbG90KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNsb3RzLkNvdW50OyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0b1Nsb3QgPT0gdGhpcy5zbG90c1tpXSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dEluZGV4ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRJbmRleCA+PSB0aGlzLnNsb3RzLkNvdW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7ICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBTaHVudERvd24oU2xvdCB0b1Nsb3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTbG90IG5leHRTbG90ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zbG90cy5Db3VudDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodG9TbG90ID09IHRoaXMuc2xvdHNbaV0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRJbmRleCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0SW5kZXggPj0gdGhpcy5zbG90cy5Db3VudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0U2xvdCA9IHRoaXMuc2xvdHNbbmV4dEluZGV4XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLkFkZExldHRlclRvU2xvdCh0b1Nsb3QuTGV0dGVyLCBuZXh0U2xvdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBTbmFwQmFja0xldHRlcihMZXR0ZXIgbGV0dGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGZyb21TbG90ID0gR2V0Q3VycmVudFNsb3QobGV0dGVyKTtcclxuICAgICAgICAgICAgbGV0dGVyLlNwcml0ZS54ID0gZnJvbVNsb3QuU3ByaXRlLnggKyAobGV0dGVyLlNwcml0ZS5hbmNob3JYICogZnJvbVNsb3QuU3ByaXRlLndpZHRoKTtcclxuICAgICAgICAgICAgbGV0dGVyLlNwcml0ZS55ID0gZnJvbVNsb3QuU3ByaXRlLnkgKyAobGV0dGVyLlNwcml0ZS5hbmNob3JZICogZnJvbVNsb3QuU3ByaXRlLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBQdXRMZXR0ZXJPblNsb3RJbml0aWFsbHkoTGV0dGVyIGxldHRlciwgU2xvdCB0b1Nsb3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXR0ZXIuU3ByaXRlLnggPSB0b1Nsb3QuU3ByaXRlLnggKyAobGV0dGVyLlNwcml0ZS5hbmNob3JYICogdG9TbG90LlNwcml0ZS53aWR0aCk7XHJcbiAgICAgICAgICAgIGxldHRlci5TcHJpdGUueSA9IHRvU2xvdC5TcHJpdGUueSArIChsZXR0ZXIuU3ByaXRlLmFuY2hvclkgKiB0b1Nsb3QuU3ByaXRlLmhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICB0b1Nsb3QuRHJvcExldHRlcihsZXR0ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEFkZExldHRlclRvU2xvdChMZXR0ZXIgbGV0dGVyLCBTbG90IHRvU2xvdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldHRlci5TcHJpdGUueCA9IHRvU2xvdC5TcHJpdGUueCArIChsZXR0ZXIuU3ByaXRlLmFuY2hvclggKiB0b1Nsb3QuU3ByaXRlLndpZHRoKTtcclxuICAgICAgICAgICAgbGV0dGVyLlNwcml0ZS55ID0gdG9TbG90LlNwcml0ZS55ICsgKGxldHRlci5TcHJpdGUuYW5jaG9yWSAqIHRvU2xvdC5TcHJpdGUuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBmcm9tU2xvdCA9IEdldEN1cnJlbnRTbG90KGxldHRlcik7XHJcbiAgICAgICAgICAgIGZyb21TbG90LlRha2VMZXR0ZXIoKTtcclxuICAgICAgICAgICAgdG9TbG90LkRyb3BMZXR0ZXIobGV0dGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBMaXN0PHN0cmluZz4gR2V0V29yZHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHdvcmQxID0gc3RyaW5nLkpvaW4oXCJcIiwgc2xvdHNbNV0uR2V0TGV0dGVyVmFsdWUoKSwgc2xvdHNbNl0uR2V0TGV0dGVyVmFsdWUoKSwgc2xvdHNbN10uR2V0TGV0dGVyVmFsdWUoKSk7XHJcbiAgICAgICAgICAgIHZhciB3b3JkMiA9IHN0cmluZy5Kb2luKFwiXCIsIHNsb3RzWzhdLkdldExldHRlclZhbHVlKCksIHNsb3RzWzZdLkdldExldHRlclZhbHVlKCksIHNsb3RzWzldLkdldExldHRlclZhbHVlKCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gZ2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkNhbGxGb3IobmV3IExpc3Q8c3RyaW5nPigpLChfbzEpPT57X28xLkFkZCh3b3JkMSk7X28xLkFkZCh3b3JkMik7cmV0dXJuIF9vMTt9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYm9vbCBJc09uU2xvdChkb3VibGUgeCwgZG91YmxlIHksIElTcHJpdGUgc3ByaXRlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHggPj0gc3ByaXRlLnggJiYgeCA8PSAoc3ByaXRlLnggKyBzcHJpdGUud2lkdGgpICYmIHkgPj0gc3ByaXRlLnkgJiYgeSA8PSAoc3ByaXRlLnkgKyBzcHJpdGUuaGVpZ2h0KSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcblxyXG5uYW1lc3BhY2UgV29yZFdvb3AuQ29yZVxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQm9hcmRCdWlsZGVyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIEJvYXJkIEJ1aWxkKElMZXR0ZXJCdWlsZGVyIGxldHRlckJ1aWxkZXIsIElTbG90QnVpbGRlciBzbG90QnVpbGRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBzbG90cyA9IGdsb2JhbDo6QnJpZGdlLlNjcmlwdC5DYWxsRm9yKG5ldyBMaXN0PFNsb3Q+KCksKF9vMSk9PntfbzEuQWRkKHNsb3RCdWlsZGVyLkJ1aWxkKDAsIDAsIDEwMCkpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoMTIwLCAwLCAxMDApKTtfbzEuQWRkKHNsb3RCdWlsZGVyLkJ1aWxkKDI0MCwgMCwgMTAwKSk7X28xLkFkZChzbG90QnVpbGRlci5CdWlsZCgzNjAsIDAsIDEwMCkpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoNDgwLCAwLCAxMDApKTtfbzEuQWRkKHNsb3RCdWlsZGVyLkJ1aWxkKDAsIDI0MCwgMTAwKSk7X28xLkFkZChzbG90QnVpbGRlci5CdWlsZCgxMjAsIDI0MCwgMTAwKSk7X28xLkFkZChzbG90QnVpbGRlci5CdWlsZCgyNDAsIDI0MCwgMTAwKSk7X28xLkFkZChzbG90QnVpbGRlci5CdWlsZCgxMjAsIDEyMCwgMTAwKSk7X28xLkFkZChzbG90QnVpbGRlci5CdWlsZCgxMjAsIDM2MCwgMTAwKSk7cmV0dXJuIF9vMTt9KTtcclxuICAgICAgICAgICAgdmFyIGxldHRlcnMgPSBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuQ2FsbEZvcihuZXcgTGlzdDxMZXR0ZXI+KCksKF9vMik9PntfbzIuQWRkKGxldHRlckJ1aWxkZXIuQnVpbGQoXCJDXCIsIDAsIDApKTtfbzIuQWRkKGxldHRlckJ1aWxkZXIuQnVpbGQoXCJBXCIsIDAsIDApKTtfbzIuQWRkKGxldHRlckJ1aWxkZXIuQnVpbGQoXCJUXCIsIDAsIDApKTtfbzIuQWRkKGxldHRlckJ1aWxkZXIuQnVpbGQoXCJNXCIsIDAsIDApKTtfbzIuQWRkKGxldHRlckJ1aWxkZXIuQnVpbGQoXCJUXCIsIDAsIDApKTtyZXR1cm4gX28yO30pO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJvYXJkID0gbmV3IEJvYXJkKGxldHRlcnMsIHNsb3RzKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkNvdW50PGdsb2JhbDo6V29yZFdvb3AuQ29yZS5MZXR0ZXI+KGxldHRlcnMpOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLlB1dExldHRlck9uU2xvdEluaXRpYWxseShsZXR0ZXJzW2ldLCBzbG90c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiBib2FyZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIFdvcmRXb29wLkNvcmVcclxue1xyXG4gICAgcHVibGljIGNsYXNzIExldHRlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBMZXR0ZXIoSVNwcml0ZSBzcHJpdGUsIHN0cmluZyBsZXR0ZXJWYWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNwcml0ZSA9IHNwcml0ZTtcclxuICAgICAgICAgICAgTGV0dGVyVmFsdWUgPSBsZXR0ZXJWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBJU3ByaXRlIFNwcml0ZSB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIExldHRlclZhbHVlIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBXb3JkV29vcC5Db3JlXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBTbG90XHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIFNsb3QoSVNwcml0ZSBzcHJpdGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTcHJpdGUgPSBzcHJpdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcm9wTGV0dGVyKExldHRlciBsZXR0ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLkxldHRlciA9IGxldHRlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFRha2VMZXR0ZXIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5MZXR0ZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIElTcHJpdGUgU3ByaXRlIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG4gICAgICAgIHB1YmxpYyBMZXR0ZXIgTGV0dGVyIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEdldExldHRlclZhbHVlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLkxldHRlciA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiX1wiO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuTGV0dGVyLkxldHRlclZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGJvb2wgSGFzTGV0dGVyKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkxldHRlciAhPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuIiwiXHJcbm5hbWVzcGFjZSBXb3JkV29vcFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU3F1YXJlRHJhd2VyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhdyhSZXR5cGVkLnBoYXNlci5QaGFzZXIuR3JhcGhpY3MgZ3JhcGhpY3MsIGRvdWJsZSBib3JkZXJDb2xvdXIsIGRvdWJsZSBmaWxsQ29sb3VyLCBkb3VibGUgd2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBncmFwaGljcy5jbGVhcigpO1xyXG5cclxuICAgICAgICAgICAgZ3JhcGhpY3MuYmVnaW5GaWxsKGZpbGxDb2xvdXIpO1xyXG4gICAgICAgICAgICBncmFwaGljcy5saW5lU3R5bGUoMiwgYm9yZGVyQ29sb3VyLCAxKTtcclxuXHJcbiAgICAgICAgICAgIGdyYXBoaWNzLm1vdmVUbygwLCAwKTtcclxuICAgICAgICAgICAgZ3JhcGhpY3MubGluZVRvKHdpZHRoLCAwKTtcclxuICAgICAgICAgICAgZ3JhcGhpY3MubGluZVRvKHdpZHRoLCB3aWR0aCk7XHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmxpbmVUbygwLCB3aWR0aCk7XHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmxpbmVUbygwLCAwKTtcclxuXHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgV29yZFdvb3AuQ29yZTtcclxuXHJcbm5hbWVzcGFjZSBXb3JkV29vcFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgTGV0dGVyQnVpbGRlciA6IElMZXR0ZXJCdWlsZGVyXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSBnYW1lO1xyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgU3F1YXJlRHJhd2VyIHNxdWFyZURyYXdlcjtcclxuXHJcbiAgICAgICAgcHVibGljIExldHRlckJ1aWxkZXIoUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdhbWUgZ2FtZSwgU3F1YXJlRHJhd2VyIHNxdWFyZURyYXdlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICAgICAgICAgIHRoaXMuc3F1YXJlRHJhd2VyID0gc3F1YXJlRHJhd2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIExldHRlciBCdWlsZChzdHJpbmcgbGV0dGVyLCBkb3VibGUgeCwgZG91YmxlIHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgZ3JhcGhpY3MgPSBnYW1lLmFkZC5ncmFwaGljcygwLCAwKTtcclxuXHJcbiAgICAgICAgICAgIHNxdWFyZURyYXdlci5EcmF3KGdyYXBoaWNzLCAweDAwMDBGRiwgMHhDQ0NDRkYsIDkwKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gZ2FtZS5hZGQudGV4dCgwLCAwLCBsZXR0ZXIsIG5ldyB7IGZvbnQgPSBcIjM0cHggQXJpYWxcIiwgZmlsbCA9IFwiI2ZmZlwiIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmFuY2hvci5zZXQoMC41KTtcclxuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IGdhbWUuYWRkLnNwcml0ZSh4LCB5LCBncmFwaGljcy5nZW5lcmF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgICAgIHNwcml0ZS5hbmNob3Iuc2V0KDAuNSk7XHJcbiAgICAgICAgICAgIHNwcml0ZS5hZGRDaGlsZCh0ZXh0KTtcclxuXHJcbiAgICAgICAgICAgIHNwcml0ZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBzcHJpdGUuaW5wdXQuZW5hYmxlRHJhZyh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTGV0dGVyKG5ldyBTcHJpdGVXcmFwcGVyKHNwcml0ZSksIGxldHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFdvcmRXb29wLkNvcmU7XHJcblxyXG5uYW1lc3BhY2UgV29yZFdvb3Bcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFNsb3RCdWlsZGVyIDogSVNsb3RCdWlsZGVyXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSBnYW1lO1xyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgU3F1YXJlRHJhd2VyIHNxdWFyZURyYXdlcjtcclxuXHJcbiAgICAgICAgcHVibGljIFNsb3RCdWlsZGVyKFJldHlwZWQucGhhc2VyLlBoYXNlci5HYW1lIGdhbWUsIFNxdWFyZURyYXdlciBzcXVhcmVEcmF3ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4gICAgICAgICAgICB0aGlzLnNxdWFyZURyYXdlciA9IHNxdWFyZURyYXdlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBTbG90IEJ1aWxkKGRvdWJsZSB4LCBkb3VibGUgeSwgZG91YmxlIHdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGdyYXBoaWNzID0gZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCk7XHJcbiAgICAgICAgICAgIHNxdWFyZURyYXdlci5EcmF3KGdyYXBoaWNzLCAweEZGRkZGRiwgMHgwMDAwMDAsIHdpZHRoKTtcclxuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IGdhbWUuYWRkLnNwcml0ZSh4LCB5LCBncmFwaGljcy5nZW5lcmF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTbG90KG5ldyBTcHJpdGVXcmFwcGVyKHNwcml0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBXb3JkV29vcC5Db3JlO1xyXG5cclxubmFtZXNwYWNlIFdvcmRXb29wXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBTcHJpdGVXcmFwcGVyIDogSVNwcml0ZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBTcHJpdGVXcmFwcGVyKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgc3ByaXRlKSBcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNwcml0ZSA9IHNwcml0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIFNwcml0ZSB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cclxuICAgICAgICBwdWJsaWMgZG91YmxlIHgge1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFNwcml0ZS54O1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgc2V0XHJcbiAgICB7XHJcbiAgICAgICAgU3ByaXRlLnggPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG59ICAgICAgICBwdWJsaWMgZG91YmxlIHkge1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFNwcml0ZS55O1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgc2V0XHJcbiAgICB7XHJcbiAgICAgICAgU3ByaXRlLnkgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG59ICAgICAgICBwdWJsaWMgZG91YmxlIHdpZHRoIHtcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBTcHJpdGUud2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBzZXRcclxuICAgIHtcclxuICAgICAgICBTcHJpdGUud2lkdGggPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG59ICAgICAgICBwdWJsaWMgZG91YmxlIGhlaWdodCB7XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gU3ByaXRlLmhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIHNldFxyXG4gICAge1xyXG4gICAgICAgIFNwcml0ZS5oZWlnaHQgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG59ICAgICAgICBwdWJsaWMgZG91YmxlIGFuY2hvclgge1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFNwcml0ZS5hbmNob3IueDtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIHNldFxyXG4gICAge1xyXG4gICAgICAgIFNwcml0ZS5hbmNob3IueCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbn0gICAgICAgIHB1YmxpYyBkb3VibGUgYW5jaG9yWSB7XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gU3ByaXRlLmFuY2hvci55O1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgc2V0XHJcbiAgICB7XHJcbiAgICAgICAgU3ByaXRlLmFuY2hvci55ID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBcclxufSAgICB9XHJcbn1cclxuIiwidXNpbmcgV29yZFdvb3AuQ29yZTtcclxuXHJcbm5hbWVzcGFjZSBXb3JkV29vcFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgV29yZFdvb3BHYW1lIDogQWJzdHJhY3RHYW1lU3RhdGVcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5HcmFwaGljcyBncmFwaGljcztcclxuICAgICAgICBwcml2YXRlIEJvYXJkIGJvYXJkO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlRleHQgd2luVGV4dDtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5UZXh0IGRlYnVnVGV4dDtcclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgUHJlbG9hZCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuY3Jvc3NPcmlnaW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBnYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzQ0ODhBQVwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgQ3JlYXRlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBib2FyZEJ1aWxkZXIgPSBuZXcgQm9hcmRCdWlsZGVyKCk7XHJcbiAgICAgICAgICAgIHZhciBzcXVhcmVEcmF3ZXIgPSBuZXcgU3F1YXJlRHJhd2VyKCk7XHJcbiAgICAgICAgICAgIHZhciBsZXR0ZXJCdWlsZGVyID0gbmV3IExldHRlckJ1aWxkZXIoZ2FtZSwgc3F1YXJlRHJhd2VyKTtcclxuICAgICAgICAgICAgdmFyIHNsb3RCdWlsZGVyID0gbmV3IFNsb3RCdWlsZGVyKGdhbWUsIHNxdWFyZURyYXdlcik7XHJcbiAgICAgICAgICAgIGJvYXJkID0gYm9hcmRCdWlsZGVyLkJ1aWxkKGxldHRlckJ1aWxkZXIsIHNsb3RCdWlsZGVyKTtcclxuXHJcbiAgICAgICAgICAgIGJvYXJkLmxldHRlcnMuRm9yRWFjaCgoZ2xvYmFsOjpTeXN0ZW0uQWN0aW9uPGdsb2JhbDo6V29yZFdvb3AuQ29yZS5MZXR0ZXI+KSh4ID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdyA9IHguU3ByaXRlIGFzIFNwcml0ZVdyYXBwZXI7XHJcbiAgICAgICAgICAgICAgICBzdy5TcHJpdGUuZXZlbnRzLm9uRHJhZ1N0YXJ0LmFkZCgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxvYmplY3Q+KSgoKSA9PiBzdy5TcHJpdGUuYnJpbmdUb1RvcCgpKSk7XHJcbiAgICAgICAgICAgICAgICBzdy5TcHJpdGUuZXZlbnRzLm9uRHJhZ1N0b3AuYWRkKChnbG9iYWw6OlN5c3RlbS5BY3Rpb24pKCgpID0+XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgRHJvcHBlZCh4KTtcclxuICAgICAgICAgICAgICAgIH0pLCB0aGlzKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB3aW5UZXh0ID0gZ2FtZS5hZGQudGV4dCg2MDAsIDAsIFwiV0lOIVwiLCBuZXcgeyBmb250ID0gXCIzNHB4IEFyaWFsXCIsIGZpbGwgPSBcIiNmZmZcIiB9KTtcclxuICAgICAgICAgICAgZGVidWdUZXh0ID0gZ2FtZS5hZGQudGV4dCgwLCA1ODAsIFwiREVCVUdcIiwgbmV3IHsgZm9udCA9IFwiMTBweCBBcmlhbFwiLCBmaWxsID0gXCIjZmZmXCIgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcm9wcGVkKExldHRlciBsZXR0ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgcG9pbnRlciA9IGdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlcjtcclxuICAgICAgICAgICAgYm9hcmQuTGV0dGVyRHJvcHBlZChwb2ludGVyLngsIHBvaW50ZXIueSwgbGV0dGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFVwZGF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgUmVuZGVyKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBhbnN3ZXJzID0gYm9hcmQuR2V0V29yZHMoKTtcclxuICAgICAgICAgICAgZGVidWdUZXh0LnRleHQgPSBzdHJpbmcuRm9ybWF0KFwiQW5zd2VyczogezB9fHsxfVwiLGFuc3dlcnNbMF0sYW5zd2Vyc1sxXSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYm9hcmQuSXNXb24oKSlcclxuICAgICAgICAgICAgICAgIHdpblRleHQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHdpblRleHQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFJlc3RhcnQoKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il0KfQo=
