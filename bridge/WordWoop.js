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
            prizeText: null,
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
                this.winText = this.game.add.text(600, 0, "WIN!", { font: "34px Arial", fill: "#fff", visible: "false" });
                this.prizeText = this.game.add.text(600, 52, "Prize Code: 100TRON", { font: "18px Arial", fill: "#fff", visible: "false" });
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
                    this.prizeText.visible = true;
                } else {
                    this.winText.visible = false;
                    this.prizeText.visible = false;
                }
            },
            Restart: function () {

            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJXb3JkV29vcC5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiQXBwLmNzIiwiQ29yZS9Cb2FyZC5jcyIsIkNvcmUvQm9hcmRCdWlsZGVyLmNzIiwiQ29yZS9MZXR0ZXIuY3MiLCJDb3JlL1Nsb3QuY3MiLCJTcXVhcmVEcmF3ZXIuY3MiLCJMZXR0ZXJCdWlsZGVyLmNzIiwiU2xvdEJ1aWxkZXIuY3MiLCJTcHJpdGVXcmFwcGVyLmNzIiwiV29yZFdvb3BHYW1lLmNzIl0sCiAgIm5hbWVzIjogWyIiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQVVZQTs7Ozs7Ozs7O29CQUtBQSxJQUFJQTt3QkFFQUE7d0JBQ0FBLHFCQUFRQTt3QkFDUkE7OztvQkFHSkEscUJBQVFBLElBQUlBLHNCQUFxQ0EsMkJBQTBDQSxJQUFJQTtvQkFDL0ZBOzs7Ozs7Ozs7Ozs7NEJDWlNBLFNBQ0xBOztnQkFFSkEsZUFBZUE7Z0JBQ2ZBLGFBQWFBOzs7OztnQkFLYkEsY0FBY0E7Z0JBQ2RBLE9BQU9BLENBQUNBLHFEQUF1QkE7O3NDQUdSQTtnQkFFdkJBLE9BQU9BLDRCQUFrRUEsMkJBQU1BLEFBQXdEQTsrQkFBS0EsaUNBQVlBOzs7cUNBR2xJQSxHQUFVQSxHQUFVQTtnQkFFMUNBLGFBQWFBLDRCQUFrRUEsMkJBQVdBLEFBQXdEQTsrQkFBS0EsY0FBU0EsR0FBR0EsR0FBR0E7OztnQkFFdEtBLElBQUlBLFVBQVVBO29CQUVWQSxvQkFBZUE7b0JBQ2ZBOzs7Z0JBR0pBLElBQUlBO29CQUVBQSxnQkFBZ0JBO29CQUNoQkEscUJBQXFCQSxRQUFRQTs7b0JBSTdCQSxxQkFBcUJBLFFBQVFBOzs7a0NBSWJBO2dCQUVwQkEsSUFBSUEsa0JBQWFBO29CQUNiQSxlQUFVQTs7OztvQ0FnQlFBO2dCQUV0QkEsS0FBS0EsV0FBV0EsSUFBSUEsa0JBQWtCQTtvQkFFbENBLElBQUlBLCtCQUFVQSxtQkFBV0E7d0JBRXJCQSxnQkFBZ0JBO3dCQUNo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QkFDMURBLGlCQUFZQSxvQ0FBK0JBOzsrQkFHM0JBO2dCQUVoQkEsY0FBY0E7Z0JBQ2RBLHlCQUFvQkEsV0FBV0EsV0FBV0E7Ozs7Z0JBUzFDQSxjQUFjQTtnQkFDZEEsc0JBQWlCQSx5Q0FBaUNBLG9CQUFXQTs7Z0JBRTdEQSxJQUFJQTtvQkFFQUE7b0JBQ0FBOztvQkFJQUE7b0JBQ0FBIiwKICAic291cmNlc0NvbnRlbnQiOiBbIlxyXG5uYW1lc3BhY2UgV29yZFdvb3Bcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEFwcFxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIFJldHlwZWQucGhhc2VyLlBoYXNlci5HYW1lIF9nYW1lO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2wgX2lzUnVuO1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgTWFpbigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTdGFydEdhbWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBTdGFydEdhbWUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKF9pc1J1bilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgX2dhbWUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgX2dhbWUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgX2lzUnVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF9nYW1lID0gbmV3IFJldHlwZWQucGhhc2VyLlBoYXNlci5HYW1lKDgwMCwgNjAwLCBSZXR5cGVkLnBoYXNlci5QaGFzZXIuQVVUTywgXCJwaGFzZXJSb290XCIsIG5ldyBXb3JkV29vcEdhbWUoKSk7XHJcbiAgICAgICAgICAgIF9pc1J1biA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcblxyXG5uYW1lc3BhY2UgV29yZFdvb3AuQ29yZVxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQm9hcmRcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgTGlzdDxMZXR0ZXI+IGxldHRlcnM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8U2xvdD4gc2xvdHM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBCb2FyZChMaXN0PExldHRlcj4gbGV0dGVycyxcclxuICAgICAgICAgICAgICAgIExpc3Q8U2xvdD4gc2xvdHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxldHRlcnMgPSBsZXR0ZXJzO1xyXG4gICAgICAgICAgICB0aGlzLnNsb3RzID0gc2xvdHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYm9vbCBJc1dvbigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgYW5zd2VycyA9IHRoaXMuR2V0V29yZHMoKTtcclxuICAgICAgICAgICAgcmV0dXJuIChhbnN3ZXJzWzBdID09IFwiQ0FUXCIgJiYgYW5zd2Vyc1sxXSA9PSBcIk1BVFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBTbG90IEdldEN1cnJlbnRTbG90KExldHRlciBsZXR0ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5GaXJzdE9yRGVmYXVsdDxnbG9iYWw6OldvcmRXb29wLkNvcmUuU2xvdD4oc2xvdHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpXb3JkV29vcC5Db3JlLlNsb3QsIGJvb2w+KSh4ID0+IHguTGV0dGVyID09IGxldHRlcikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgTGV0dGVyRHJvcHBlZChkb3VibGUgeCwgZG91YmxlIHksIExldHRlciBsZXR0ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgdG9TbG90ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5GaXJzdE9yRGVmYXVsdDxnbG9iYWw6OldvcmRXb29wLkNvcmUuU2xvdD4odGhpcy5zbG90cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OldvcmRXb29wLkNvcmUuU2xvdCwgYm9vbD4pKHMgPT4gSXNPblNsb3QoeCwgeSwgcy5TcHJpdGUpKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodG9TbG90ID09IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNuYXBCYWNrTGV0dGVyKGxldHRlcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0b1Nsb3QuSGFzTGV0dGVyKCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuQ2xlYXJTcGFjZSh0b1Nsb3QpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5BZGRMZXR0ZXJUb1Nsb3QobGV0dGVyLCB0b1Nsb3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5BZGRMZXR0ZXJUb1Nsb3QobGV0dGVyLCB0b1Nsb3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQ2xlYXJTcGFjZShTbG90IHRvU2xvdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChDYW5TaHVudERvd24odG9TbG90KSlcclxuICAgICAgICAgICAgICAgIFNodW50RG93bih0b1Nsb3QpO1xyXG5cclxuICAgICAgICAgICAgLy9TbG90IG5leHRTbG90ID0gbnVsbDtcclxuICAgICAgICAgICAgLy9mb3IgKHZhciBpPTA7IGk8dGhpcy5zbG90cy5Db3VudDsgaSsrKVxyXG4gICAgICAgICAgICAvL3tcclxuICAgICAgICAgICAgLy8gICAgaWYgKHRvU2xvdCA9PSB0aGlzLnNsb3RzW2ldKVxyXG4gICAgICAgICAgICAvLyAgICB7XHJcbiAgICAgICAgICAgIC8vICAgICAgICB2YXIgbmV4dEluZGV4ID0gaSArIDE7XHJcbiAgICAgICAgICAgIC8vICAgICAgICBpZiAobmV4dEluZGV4ID49IHRoaXMuc2xvdHMuQ291bnQpXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgbmV4dEluZGV4ID0gMDtcclxuICAgICAgICAgICAgLy8gICAgICAgIG5leHRTbG90ID0gdGhpcy5zbG90c1tuZXh0SW5kZXhdO1xyXG4gICAgICAgICAgICAvLyAgICB9XHJcbiAgICAgICAgICAgIC8vfVxyXG4gICAgICAgICAgICAvL3RoaXMuQWRkTGV0dGVyVG9TbG90KHRvU2xvdC5MZXR0ZXIsIG5leHRTbG90KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYm9vbCBDYW5TaHVudERvd24oU2xvdCB0b1Nsb3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2xvdHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRvU2xvdCA9PSB0aGlzLnNsb3RzW2ldKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0SW5kZXggPSBpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dEluZGV4ID49IHRoaXMuc2xvdHMuQ291bnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFNodW50RG93bihTbG90IHRvU2xvdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNsb3QgbmV4dFNsb3QgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNsb3RzLkNvdW50OyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0b1Nsb3QgPT0gdGhpcy5zbG90c1tpXSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dEluZGV4ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRJbmRleCA+PSB0aGlzLnNsb3RzLkNvdW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHRTbG90ID0gdGhpcy5zbG90c1tuZXh0SW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuQWRkTGV0dGVyVG9TbG90KHRvU2xvdC5MZXR0ZXIsIG5leHRTbG90KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNuYXBCYWNrTGV0dGVyKExldHRlciBsZXR0ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgZnJvbVNsb3QgPSBHZXRDdXJyZW50U2xvdChsZXR0ZXIpO1xyXG4gICAgICAgICAgICBsZXR0ZXIuU3ByaXRlLnggPSBmcm9tU2xvdC5TcHJpdGUueCArIChsZXR0ZXIuU3ByaXRlLmFuY2hvclggKiBmcm9tU2xvdC5TcHJpdGUud2lkdGgpO1xyXG4gICAgICAgICAgICBsZXR0ZXIuU3ByaXRlLnkgPSBmcm9tU2xvdC5TcHJpdGUueSArIChsZXR0ZXIuU3ByaXRlLmFuY2hvclkgKiBmcm9tU2xvdC5TcHJpdGUuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFB1dExldHRlck9uU2xvdEluaXRpYWxseShMZXR0ZXIgbGV0dGVyLCBTbG90IHRvU2xvdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldHRlci5TcHJpdGUueCA9IHRvU2xvdC5TcHJpdGUueCArIChsZXR0ZXIuU3ByaXRlLmFuY2hvclggKiB0b1Nsb3QuU3ByaXRlLndpZHRoKTtcclxuICAgICAgICAgICAgbGV0dGVyLlNwcml0ZS55ID0gdG9TbG90LlNwcml0ZS55ICsgKGxldHRlci5TcHJpdGUuYW5jaG9yWSAqIHRvU2xvdC5TcHJpdGUuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIHRvU2xvdC5Ecm9wTGV0dGVyKGxldHRlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQWRkTGV0dGVyVG9TbG90KExldHRlciBsZXR0ZXIsIFNsb3QgdG9TbG90KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0dGVyLlNwcml0ZS54ID0gdG9TbG90LlNwcml0ZS54ICsgKGxldHRlci5TcHJpdGUuYW5jaG9yWCAqIHRvU2xvdC5TcHJpdGUud2lkdGgpO1xyXG4gICAgICAgICAgICBsZXR0ZXIuU3ByaXRlLnkgPSB0b1Nsb3QuU3ByaXRlLnkgKyAobGV0dGVyLlNwcml0ZS5hbmNob3JZICogdG9TbG90LlNwcml0ZS5oZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGZyb21TbG90ID0gR2V0Q3VycmVudFNsb3QobGV0dGVyKTtcclxuICAgICAgICAgICAgZnJvbVNsb3QuVGFrZUxldHRlcigpO1xyXG4gICAgICAgICAgICB0b1Nsb3QuRHJvcExldHRlcihsZXR0ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIExpc3Q8c3RyaW5nPiBHZXRXb3JkcygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgd29yZDEgPSBzdHJpbmcuSm9pbihcIlwiLCBzbG90c1s1XS5HZXRMZXR0ZXJWYWx1ZSgpLCBzbG90c1s2XS5HZXRMZXR0ZXJWYWx1ZSgpLCBzbG90c1s3XS5HZXRMZXR0ZXJWYWx1ZSgpKTtcclxuICAgICAgICAgICAgdmFyIHdvcmQyID0gc3RyaW5nLkpvaW4oXCJcIiwgc2xvdHNbOF0uR2V0TGV0dGVyVmFsdWUoKSwgc2xvdHNbNl0uR2V0TGV0dGVyVmFsdWUoKSwgc2xvdHNbOV0uR2V0TGV0dGVyVmFsdWUoKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuQ2FsbEZvcihuZXcgTGlzdDxzdHJpbmc+KCksKF9vMSk9PntfbzEuQWRkKHdvcmQxKTtfbzEuQWRkKHdvcmQyKTtyZXR1cm4gX28xO30pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBib29sIElzT25TbG90KGRvdWJsZSB4LCBkb3VibGUgeSwgSVNwcml0ZSBzcHJpdGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoeCA+PSBzcHJpdGUueCAmJiB4IDw9IChzcHJpdGUueCArIHNwcml0ZS53aWR0aCkgJiYgeSA+PSBzcHJpdGUueSAmJiB5IDw9IChzcHJpdGUueSArIHNwcml0ZS5oZWlnaHQpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxuXHJcbm5hbWVzcGFjZSBXb3JkV29vcC5Db3JlXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBCb2FyZEJ1aWxkZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgQm9hcmQgQnVpbGQoSUxldHRlckJ1aWxkZXIgbGV0dGVyQnVpbGRlciwgSVNsb3RCdWlsZGVyIHNsb3RCdWlsZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHNsb3RzID0gZ2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkNhbGxGb3IobmV3IExpc3Q8U2xvdD4oKSwoX28xKT0+e19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoMCwgMCwgMTAwKSk7X28xLkFkZChzbG90QnVpbGRlci5CdWlsZCgxMjAsIDAsIDEwMCkpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoMjQwLCAwLCAxMDApKTtfbzEuQWRkKHNsb3RCdWlsZGVyLkJ1aWxkKDM2MCwgMCwgMTAwKSk7X28xLkFkZChzbG90QnVpbGRlci5CdWlsZCg0ODAsIDAsIDEwMCkpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoMCwgMjQwLCAxMDApKTtfbzEuQWRkKHNsb3RCdWlsZGVyLkJ1aWxkKDEyMCwgMjQwLCAxMDApKTtfbzEuQWRkKHNsb3RCdWlsZGVyLkJ1aWxkKDI0MCwgMjQwLCAxMDApKTtfbzEuQWRkKHNsb3RCdWlsZGVyLkJ1aWxkKDEyMCwgMTIwLCAxMDApKTtfbzEuQWRkKHNsb3RCdWlsZGVyLkJ1aWxkKDEyMCwgMzYwLCAxMDApKTtyZXR1cm4gX28xO30pO1xyXG4gICAgICAgICAgICB2YXIgbGV0dGVycyA9IGdsb2JhbDo6QnJpZGdlLlNjcmlwdC5DYWxsRm9yKG5ldyBMaXN0PExldHRlcj4oKSwoX28yKT0+e19vMi5BZGQobGV0dGVyQnVpbGRlci5CdWlsZChcIkNcIiwgMCwgMCkpO19vMi5BZGQobGV0dGVyQnVpbGRlci5CdWlsZChcIkFcIiwgMCwgMCkpO19vMi5BZGQobGV0dGVyQnVpbGRlci5CdWlsZChcIlRcIiwgMCwgMCkpO19vMi5BZGQobGV0dGVyQnVpbGRlci5CdWlsZChcIk1cIiwgMCwgMCkpO19vMi5BZGQobGV0dGVyQnVpbGRlci5CdWlsZChcIlRcIiwgMCwgMCkpO3JldHVybiBfbzI7fSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYm9hcmQgPSBuZXcgQm9hcmQobGV0dGVycywgc2xvdHMpO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPFN5c3RlbS5MaW5xLkVudW1lcmFibGUuQ291bnQ8Z2xvYmFsOjpXb3JkV29vcC5Db3JlLkxldHRlcj4obGV0dGVycyk7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYm9hcmQuUHV0TGV0dGVyT25TbG90SW5pdGlhbGx5KGxldHRlcnNbaV0sIHNsb3RzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIGJvYXJkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgV29yZFdvb3AuQ29yZVxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgTGV0dGVyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIExldHRlcihJU3ByaXRlIHNwcml0ZSwgc3RyaW5nIGxldHRlclZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU3ByaXRlID0gc3ByaXRlO1xyXG4gICAgICAgICAgICBMZXR0ZXJWYWx1ZSA9IGxldHRlclZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIElTcHJpdGUgU3ByaXRlIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgTGV0dGVyVmFsdWUgeyBnZXQ7IHByaXZhdGUgc2V0OyB9XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIFdvcmRXb29wLkNvcmVcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFNsb3RcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgU2xvdChJU3ByaXRlIHNwcml0ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNwcml0ZSA9IHNwcml0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyb3BMZXR0ZXIoTGV0dGVyIGxldHRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuTGV0dGVyID0gbGV0dGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgVGFrZUxldHRlcigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLkxldHRlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgSVNwcml0ZSBTcHJpdGUgeyBnZXQ7IHByaXZhdGUgc2V0OyB9XHJcbiAgICAgICAgcHVibGljIExldHRlciBMZXR0ZXIgeyBnZXQ7IHByaXZhdGUgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgR2V0TGV0dGVyVmFsdWUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuTGV0dGVyID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJfXCI7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5MZXR0ZXIuTGV0dGVyVmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYm9vbCBIYXNMZXR0ZXIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuTGV0dGVyICE9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufVxyXG4iLCJcclxubmFtZXNwYWNlIFdvcmRXb29wXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBTcXVhcmVEcmF3ZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3KFJldHlwZWQucGhhc2VyLlBoYXNlci5HcmFwaGljcyBncmFwaGljcywgZG91YmxlIGJvcmRlckNvbG91ciwgZG91YmxlIGZpbGxDb2xvdXIsIGRvdWJsZSB3aWR0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmNsZWFyKCk7XHJcblxyXG4gICAgICAgICAgICBncmFwaGljcy5iZWdpbkZpbGwoZmlsbENvbG91cik7XHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmxpbmVTdHlsZSgyLCBib3JkZXJDb2xvdXIsIDEpO1xyXG5cclxuICAgICAgICAgICAgZ3JhcGhpY3MubW92ZVRvKDAsIDApO1xyXG4gICAgICAgICAgICBncmFwaGljcy5saW5lVG8od2lkdGgsIDApO1xyXG4gICAgICAgICAgICBncmFwaGljcy5saW5lVG8od2lkdGgsIHdpZHRoKTtcclxuICAgICAgICAgICAgZ3JhcGhpY3MubGluZVRvKDAsIHdpZHRoKTtcclxuICAgICAgICAgICAgZ3JhcGhpY3MubGluZVRvKDAsIDApO1xyXG5cclxuICAgICAgICAgICAgZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBXb3JkV29vcC5Db3JlO1xyXG5cclxubmFtZXNwYWNlIFdvcmRXb29wXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBMZXR0ZXJCdWlsZGVyIDogSUxldHRlckJ1aWxkZXJcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IFJldHlwZWQucGhhc2VyLlBoYXNlci5HYW1lIGdhbWU7XHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBTcXVhcmVEcmF3ZXIgc3F1YXJlRHJhd2VyO1xyXG5cclxuICAgICAgICBwdWJsaWMgTGV0dGVyQnVpbGRlcihSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSBnYW1lLCBTcXVhcmVEcmF3ZXIgc3F1YXJlRHJhd2VyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuICAgICAgICAgICAgdGhpcy5zcXVhcmVEcmF3ZXIgPSBzcXVhcmVEcmF3ZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgTGV0dGVyIEJ1aWxkKHN0cmluZyBsZXR0ZXIsIGRvdWJsZSB4LCBkb3VibGUgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBncmFwaGljcyA9IGdhbWUuYWRkLmdyYXBoaWNzKDAsIDApO1xyXG5cclxuICAgICAgICAgICAgc3F1YXJlRHJhd2VyLkRyYXcoZ3JhcGhpY3MsIDB4MDAwMEZGLCAweENDQ0NGRiwgOTApO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRleHQgPSBnYW1lLmFkZC50ZXh0KDAsIDAsIGxldHRlciwgbmV3IHsgZm9udCA9IFwiMzRweCBBcmlhbFwiLCBmaWxsID0gXCIjZmZmXCIgfSk7XHJcbiAgICAgICAgICAgIHRleHQuYW5jaG9yLnNldCgwLjUpO1xyXG4gICAgICAgICAgICB2YXIgc3ByaXRlID0gZ2FtZS5hZGQuc3ByaXRlKHgsIHksIGdyYXBoaWNzLmdlbmVyYXRlVGV4dHVyZSgpKTtcclxuICAgICAgICAgICAgc3ByaXRlLmFuY2hvci5zZXQoMC41KTtcclxuICAgICAgICAgICAgc3ByaXRlLmFkZENoaWxkKHRleHQpO1xyXG5cclxuICAgICAgICAgICAgc3ByaXRlLmlucHV0RW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHNwcml0ZS5pbnB1dC5lbmFibGVEcmFnKHRydWUpO1xyXG5cclxuICAgICAgICAgICAgZ3JhcGhpY3MuZGVzdHJveSgpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBMZXR0ZXIobmV3IFNwcml0ZVdyYXBwZXIoc3ByaXRlKSwgbGV0dGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgV29yZFdvb3AuQ29yZTtcclxuXHJcbm5hbWVzcGFjZSBXb3JkV29vcFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU2xvdEJ1aWxkZXIgOiBJU2xvdEJ1aWxkZXJcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IFJldHlwZWQucGhhc2VyLlBoYXNlci5HYW1lIGdhbWU7XHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBTcXVhcmVEcmF3ZXIgc3F1YXJlRHJhd2VyO1xyXG5cclxuICAgICAgICBwdWJsaWMgU2xvdEJ1aWxkZXIoUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdhbWUgZ2FtZSwgU3F1YXJlRHJhd2VyIHNxdWFyZURyYXdlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICAgICAgICAgIHRoaXMuc3F1YXJlRHJhd2VyID0gc3F1YXJlRHJhd2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIFNsb3QgQnVpbGQoZG91YmxlIHgsIGRvdWJsZSB5LCBkb3VibGUgd2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgZ3JhcGhpY3MgPSBnYW1lLmFkZC5ncmFwaGljcygwLCAwKTtcclxuICAgICAgICAgICAgc3F1YXJlRHJhd2VyLkRyYXcoZ3JhcGhpY3MsIDB4RkZGRkZGLCAweDAwMDAwMCwgd2lkdGgpO1xyXG4gICAgICAgICAgICB2YXIgc3ByaXRlID0gZ2FtZS5hZGQuc3ByaXRlKHgsIHksIGdyYXBoaWNzLmdlbmVyYXRlVGV4dHVyZSgpKTtcclxuICAgICAgICAgICAgZ3JhcGhpY3MuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNsb3QobmV3IFNwcml0ZVdyYXBwZXIoc3ByaXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFdvcmRXb29wLkNvcmU7XHJcblxyXG5uYW1lc3BhY2UgV29yZFdvb3Bcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFNwcml0ZVdyYXBwZXIgOiBJU3ByaXRlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIFNwcml0ZVdyYXBwZXIoUmV0eXBlZC5waGFzZXIuUGhhc2VyLlNwcml0ZSBzcHJpdGUpIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU3ByaXRlID0gc3ByaXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgU3ByaXRlIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG4gICAgICAgIHB1YmxpYyBkb3VibGUgeCB7XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gU3ByaXRlLng7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBzZXRcclxuICAgIHtcclxuICAgICAgICBTcHJpdGUueCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbn0gICAgICAgIHB1YmxpYyBkb3VibGUgeSB7XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gU3ByaXRlLnk7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBzZXRcclxuICAgIHtcclxuICAgICAgICBTcHJpdGUueSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbn0gICAgICAgIHB1YmxpYyBkb3VibGUgd2lkdGgge1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFNwcml0ZS53aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIHNldFxyXG4gICAge1xyXG4gICAgICAgIFNwcml0ZS53aWR0aCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbn0gICAgICAgIHB1YmxpYyBkb3VibGUgaGVpZ2h0IHtcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBTcHJpdGUuaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgc2V0XHJcbiAgICB7XHJcbiAgICAgICAgU3ByaXRlLmhlaWdodCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbn0gICAgICAgIHB1YmxpYyBkb3VibGUgYW5jaG9yWCB7XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gU3ByaXRlLmFuY2hvci54O1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgc2V0XHJcbiAgICB7XHJcbiAgICAgICAgU3ByaXRlLmFuY2hvci54ID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBcclxufSAgICAgICAgcHVibGljIGRvdWJsZSBhbmNob3JZIHtcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBTcHJpdGUuYW5jaG9yLnk7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBzZXRcclxuICAgIHtcclxuICAgICAgICBTcHJpdGUuYW5jaG9yLnkgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG59ICAgIH1cclxufVxyXG4iLCJ1c2luZyBXb3JkV29vcC5Db3JlO1xyXG5cclxubmFtZXNwYWNlIFdvcmRXb29wXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBXb3JkV29vcEdhbWUgOiBBYnN0cmFjdEdhbWVTdGF0ZVxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdyYXBoaWNzIGdyYXBoaWNzO1xyXG4gICAgICAgIHByaXZhdGUgQm9hcmQgYm9hcmQ7XHJcbiAgICAgICAgcHJpdmF0ZSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuVGV4dCB3aW5UZXh0O1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlRleHQgcHJpemVUZXh0O1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlRleHQgZGVidWdUZXh0O1xyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBQcmVsb2FkKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdhbWUubG9hZC5jcm9zc09yaWdpbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjNDQ4OEFBXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBDcmVhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGJvYXJkQnVpbGRlciA9IG5ldyBCb2FyZEJ1aWxkZXIoKTtcclxuICAgICAgICAgICAgdmFyIHNxdWFyZURyYXdlciA9IG5ldyBTcXVhcmVEcmF3ZXIoKTtcclxuICAgICAgICAgICAgdmFyIGxldHRlckJ1aWxkZXIgPSBuZXcgTGV0dGVyQnVpbGRlcihnYW1lLCBzcXVhcmVEcmF3ZXIpO1xyXG4gICAgICAgICAgICB2YXIgc2xvdEJ1aWxkZXIgPSBuZXcgU2xvdEJ1aWxkZXIoZ2FtZSwgc3F1YXJlRHJhd2VyKTtcclxuICAgICAgICAgICAgYm9hcmQgPSBib2FyZEJ1aWxkZXIuQnVpbGQobGV0dGVyQnVpbGRlciwgc2xvdEJ1aWxkZXIpO1xyXG5cclxuICAgICAgICAgICAgYm9hcmQubGV0dGVycy5Gb3JFYWNoKChnbG9iYWw6OlN5c3RlbS5BY3Rpb248Z2xvYmFsOjpXb3JkV29vcC5Db3JlLkxldHRlcj4pKHggPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN3ID0geC5TcHJpdGUgYXMgU3ByaXRlV3JhcHBlcjtcclxuICAgICAgICAgICAgICAgIHN3LlNwcml0ZS5ldmVudHMub25EcmFnU3RhcnQuYWRkKChnbG9iYWw6OlN5c3RlbS5GdW5jPG9iamVjdD4pKCgpID0+IHN3LlNwcml0ZS5icmluZ1RvVG9wKCkpKTtcclxuICAgICAgICAgICAgICAgIHN3LlNwcml0ZS5ldmVudHMub25EcmFnU3RvcC5hZGQoKGdsb2JhbDo6U3lzdGVtLkFjdGlvbikoKCkgPT5cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBEcm9wcGVkKHgpO1xyXG4gICAgICAgICAgICAgICAgfSksIHRoaXMpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIHdpblRleHQgPSBnYW1lLmFkZC50ZXh0KDYwMCwgMCwgXCJXSU4hXCIsIG5ldyB7IGZvbnQgPSBcIjM0cHggQXJpYWxcIiwgZmlsbCA9IFwiI2ZmZlwiLCB2aXNpYmxlPVwiZmFsc2VcIiB9KTtcclxuICAgICAgICAgICAgcHJpemVUZXh0ID0gZ2FtZS5hZGQudGV4dCg2MDAsIDUyLCBcIlByaXplIENvZGU6IDEwMFRST05cIiwgbmV3IHsgZm9udCA9IFwiMThweCBBcmlhbFwiLCBmaWxsID0gXCIjZmZmXCIsIHZpc2libGUgPSBcImZhbHNlXCIgfSk7XHJcbiAgICAgICAgICAgIGRlYnVnVGV4dCA9IGdhbWUuYWRkLnRleHQoMCwgNTgwLCBcIkRFQlVHXCIsIG5ldyB7IGZvbnQgPSBcIjEwcHggQXJpYWxcIiwgZmlsbCA9IFwiI2ZmZlwiIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJvcHBlZChMZXR0ZXIgbGV0dGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHBvaW50ZXIgPSBnYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXI7XHJcbiAgICAgICAgICAgIGJvYXJkLkxldHRlckRyb3BwZWQocG9pbnRlci54LCBwb2ludGVyLnksIGxldHRlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBVcGRhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFJlbmRlcigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgYW5zd2VycyA9IGJvYXJkLkdldFdvcmRzKCk7XHJcbiAgICAgICAgICAgIGRlYnVnVGV4dC50ZXh0ID0gc3RyaW5nLkZvcm1hdChcIkFuc3dlcnM6IHswfXx7MX1cIixhbnN3ZXJzWzBdLGFuc3dlcnNbMV0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvYXJkLklzV29uKCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHdpblRleHQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBwcml6ZVRleHQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB3aW5UZXh0LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHByaXplVGV4dC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBSZXN0YXJ0KClcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdCn0K
