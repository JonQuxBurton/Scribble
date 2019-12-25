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
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(0, 0, 100, 137817, 5009632));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(120, 0, 100, 137817, 5009632));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(240, 0, 100, 137817, 5009632));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(360, 0, 100, 137817, 5009632));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(480, 0, 100, 137817, 5009632));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(0, 240, 100, 993677, 6398198));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(120, 240, 100, 993677, 6398198));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(240, 240, 100, 993677, 6398198));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(120, 120, 100, 993677, 6398198));
                        _o1.add(slotBuilder.WordWoop$Core$ISlotBuilder$Build(120, 360, 100, 993677, 6398198));
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

                this.squareDrawer.Draw(graphics, 16777215, 993677, 90);

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
            Build: function (x, y, width, borderColor, backgroundColor) {
                var graphics = this.game.add.graphics(0, 0);
                this.squareDrawer.Draw(graphics, borderColor, backgroundColor, width);
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
                this.game.stage.backgroundColor = "#FAFAFA";
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
                this.winText = this.game.add.text(600, 0, "WIN!", { font: "34px Arial", fill: "#000", visible: "false" });
                this.prizeText = this.game.add.text(600, 52, "Prize Code: 100TRON", { font: "18px Arial", fill: "#000", visible: "false" });
                this.debugText = this.game.add.text(0, 580, "DEBUG", { font: "10px Arial", fill: "#000" });
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJXb3JkV29vcC5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiQXBwLmNzIiwiQ29yZS9Cb2FyZC5jcyIsIkNvcmUvQm9hcmRCdWlsZGVyLmNzIiwiQ29yZS9MZXR0ZXIuY3MiLCJDb3JlL1Nsb3QuY3MiLCJTcXVhcmVEcmF3ZXIuY3MiLCJMZXR0ZXJCdWlsZGVyLmNzIiwiU2xvdEJ1aWxkZXIuY3MiLCJTcHJpdGVXcmFwcGVyLmNzIiwiV29yZFdvb3BHYW1lLmNzIl0sCiAgIm5hbWVzIjogWyIiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQVVZQTs7Ozs7Ozs7O29CQUtBQSxJQUFJQTt3QkFFQUE7d0JBQ0FBLHFCQUFRQTt3QkFDUkE7OztvQkFHSkEscUJBQVFBLElBQUlBLHNCQUFxQ0EsMkJBQTBDQSxJQUFJQTtvQkFDL0ZBOzs7Ozs7Ozs7Ozs7NEJDWlNBLFNBQ0xBOztnQkFFSkEsZUFBZUE7Z0JBQ2ZBLGFBQWFBOzs7OztnQkFLYkEsY0FBY0E7Z0JBQ2RBLE9BQU9BLENBQUNBLHFEQUF1QkE7O3NDQUdSQTtnQkFFdkJBLE9BQU9BLDRCQUFrRUEsMkJBQU1BLEFBQXdEQTsrQkFBS0EsaUNBQVlBOzs7cUNBR2xJQSxHQUFVQSxHQUFVQTtnQkFFMUNBLGFBQWFBLDRCQUFrRUEsMkJBQVdBLEFBQXdEQTsrQkFBS0EsY0FBU0EsR0FBR0EsR0FBR0E7OztnQkFFdEtBLElBQUlBLFVBQVVBO29CQUVWQSxvQkFBZUE7b0JBQ2ZBOzs7Z0JBR0pBLElBQUlBO29CQUVBQSxnQkFBZ0JBO29CQUNoQkEscUJBQXFCQSxRQUFRQTs7b0JBSTdCQSxxQkFBcUJBLFFBQVFBOzs7a0NBSWJBO2dCQUVwQkEsSUFBSUEsa0JBQWFBO29CQUNiQSxlQUFVQTs7OztvQ0FnQlFBO2dCQUV0QkEsS0FBS0EsV0FBV0EsSUFBSUEsa0JBQWtCQTtvQkFFbENBLElBQUlBLCtCQUFVQSxtQkFBV0E7d0JBRXJCQSxnQkFBZ0JBO3dCQUNo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QTtnQkFDeENBLGlCQUFZQSxtREFBOENBO2dCQUMxREEsaUJBQVlBLG9DQUErQkE7OytCQUczQkE7Z0JBRWhCQSxjQUFjQTtnQkFDZEEseUJBQW9CQSxXQUFXQSxXQUFXQTs7OztnQkFTMUNBLGNBQWNBO2dCQUNkQSxzQkFBaUJBLHlDQUFpQ0Esb0JBQVdBOztnQkFFN0RBLElBQUlBO29CQUVBQTtvQkFDQUE7O29CQUlBQTtvQkFDQUEiLAogICJzb3VyY2VzQ29udGVudCI6IFsiXHJcbm5hbWVzcGFjZSBXb3JkV29vcFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQXBwXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdhbWUgX2dhbWU7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBfaXNSdW47XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFN0YXJ0R2FtZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIFN0YXJ0R2FtZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoX2lzUnVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBfZ2FtZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICBfZ2FtZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBfaXNSdW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgX2dhbWUgPSBuZXcgUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdhbWUoODAwLCA2MDAsIFJldHlwZWQucGhhc2VyLlBoYXNlci5BVVRPLCBcInBoYXNlclJvb3RcIiwgbmV3IFdvcmRXb29wR2FtZSgpKTtcclxuICAgICAgICAgICAgX2lzUnVuID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxuXHJcbm5hbWVzcGFjZSBXb3JkV29vcC5Db3JlXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBCb2FyZFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBMaXN0PExldHRlcj4gbGV0dGVycztcclxuICAgICAgICBwdWJsaWMgTGlzdDxTbG90PiBzbG90cztcclxuXHJcbiAgICAgICAgcHVibGljIEJvYXJkKExpc3Q8TGV0dGVyPiBsZXR0ZXJzLFxyXG4gICAgICAgICAgICAgICAgTGlzdDxTbG90PiBzbG90cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGV0dGVycyA9IGxldHRlcnM7XHJcbiAgICAgICAgICAgIHRoaXMuc2xvdHMgPSBzbG90cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBib29sIElzV29uKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBhbnN3ZXJzID0gdGhpcy5HZXRXb3JkcygpO1xyXG4gICAgICAgICAgICByZXR1cm4gKGFuc3dlcnNbMF0gPT0gXCJDQVRcIiAmJiBhbnN3ZXJzWzFdID09IFwiTUFUXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIFNsb3QgR2V0Q3VycmVudFNsb3QoTGV0dGVyIGxldHRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0T3JEZWZhdWx0PGdsb2JhbDo6V29yZFdvb3AuQ29yZS5TbG90PihzbG90cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OldvcmRXb29wLkNvcmUuU2xvdCwgYm9vbD4pKHggPT4geC5MZXR0ZXIgPT0gbGV0dGVyKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBMZXR0ZXJEcm9wcGVkKGRvdWJsZSB4LCBkb3VibGUgeSwgTGV0dGVyIGxldHRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciB0b1Nsb3QgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0T3JEZWZhdWx0PGdsb2JhbDo6V29yZFdvb3AuQ29yZS5TbG90Pih0aGlzLnNsb3RzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6V29yZFdvb3AuQ29yZS5TbG90LCBib29sPikocyA9PiBJc09uU2xvdCh4LCB5LCBzLlNwcml0ZSkpKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0b1Nsb3QgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgU25hcEJhY2tMZXR0ZXIobGV0dGVyKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRvU2xvdC5IYXNMZXR0ZXIoKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5DbGVhclNwYWNlKHRvU2xvdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkFkZExldHRlclRvU2xvdChsZXR0ZXIsIHRvU2xvdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkFkZExldHRlclRvU2xvdChsZXR0ZXIsIHRvU2xvdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDbGVhclNwYWNlKFNsb3QgdG9TbG90KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKENhblNodW50RG93bih0b1Nsb3QpKVxyXG4gICAgICAgICAgICAgICAgU2h1bnREb3duKHRvU2xvdCk7XHJcblxyXG4gICAgICAgICAgICAvL1Nsb3QgbmV4dFNsb3QgPSBudWxsO1xyXG4gICAgICAgICAgICAvL2ZvciAodmFyIGk9MDsgaTx0aGlzLnNsb3RzLkNvdW50OyBpKyspXHJcbiAgICAgICAgICAgIC8ve1xyXG4gICAgICAgICAgICAvLyAgICBpZiAodG9TbG90ID09IHRoaXMuc2xvdHNbaV0pXHJcbiAgICAgICAgICAgIC8vICAgIHtcclxuICAgICAgICAgICAgLy8gICAgICAgIHZhciBuZXh0SW5kZXggPSBpICsgMTtcclxuICAgICAgICAgICAgLy8gICAgICAgIGlmIChuZXh0SW5kZXggPj0gdGhpcy5zbG90cy5Db3VudClcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICBuZXh0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAvLyAgICAgICAgbmV4dFNsb3QgPSB0aGlzLnNsb3RzW25leHRJbmRleF07XHJcbiAgICAgICAgICAgIC8vICAgIH1cclxuICAgICAgICAgICAgLy99XHJcbiAgICAgICAgICAgIC8vdGhpcy5BZGRMZXR0ZXJUb1Nsb3QodG9TbG90LkxldHRlciwgbmV4dFNsb3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBib29sIENhblNodW50RG93bihTbG90IHRvU2xvdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zbG90cy5Db3VudDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodG9TbG90ID09IHRoaXMuc2xvdHNbaV0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRJbmRleCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0SW5kZXggPj0gdGhpcy5zbG90cy5Db3VudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgU2h1bnREb3duKFNsb3QgdG9TbG90KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU2xvdCBuZXh0U2xvdCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2xvdHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRvU2xvdCA9PSB0aGlzLnNsb3RzW2ldKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0SW5kZXggPSBpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dEluZGV4ID49IHRoaXMuc2xvdHMuQ291bnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dFNsb3QgPSB0aGlzLnNsb3RzW25leHRJbmRleF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5BZGRMZXR0ZXJUb1Nsb3QodG9TbG90LkxldHRlciwgbmV4dFNsb3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgU25hcEJhY2tMZXR0ZXIoTGV0dGVyIGxldHRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBmcm9tU2xvdCA9IEdldEN1cnJlbnRTbG90KGxldHRlcik7XHJcbiAgICAgICAgICAgIGxldHRlci5TcHJpdGUueCA9IGZyb21TbG90LlNwcml0ZS54ICsgKGxldHRlci5TcHJpdGUuYW5jaG9yWCAqIGZyb21TbG90LlNwcml0ZS53aWR0aCk7XHJcbiAgICAgICAgICAgIGxldHRlci5TcHJpdGUueSA9IGZyb21TbG90LlNwcml0ZS55ICsgKGxldHRlci5TcHJpdGUuYW5jaG9yWSAqIGZyb21TbG90LlNwcml0ZS5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUHV0TGV0dGVyT25TbG90SW5pdGlhbGx5KExldHRlciBsZXR0ZXIsIFNsb3QgdG9TbG90KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0dGVyLlNwcml0ZS54ID0gdG9TbG90LlNwcml0ZS54ICsgKGxldHRlci5TcHJpdGUuYW5jaG9yWCAqIHRvU2xvdC5TcHJpdGUud2lkdGgpO1xyXG4gICAgICAgICAgICBsZXR0ZXIuU3ByaXRlLnkgPSB0b1Nsb3QuU3ByaXRlLnkgKyAobGV0dGVyLlNwcml0ZS5hbmNob3JZICogdG9TbG90LlNwcml0ZS5oZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgdG9TbG90LkRyb3BMZXR0ZXIobGV0dGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBBZGRMZXR0ZXJUb1Nsb3QoTGV0dGVyIGxldHRlciwgU2xvdCB0b1Nsb3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXR0ZXIuU3ByaXRlLnggPSB0b1Nsb3QuU3ByaXRlLnggKyAobGV0dGVyLlNwcml0ZS5hbmNob3JYICogdG9TbG90LlNwcml0ZS53aWR0aCk7XHJcbiAgICAgICAgICAgIGxldHRlci5TcHJpdGUueSA9IHRvU2xvdC5TcHJpdGUueSArIChsZXR0ZXIuU3ByaXRlLmFuY2hvclkgKiB0b1Nsb3QuU3ByaXRlLmhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZnJvbVNsb3QgPSBHZXRDdXJyZW50U2xvdChsZXR0ZXIpO1xyXG4gICAgICAgICAgICBmcm9tU2xvdC5UYWtlTGV0dGVyKCk7XHJcbiAgICAgICAgICAgIHRvU2xvdC5Ecm9wTGV0dGVyKGxldHRlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgTGlzdDxzdHJpbmc+IEdldFdvcmRzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciB3b3JkMSA9IHN0cmluZy5Kb2luKFwiXCIsIHNsb3RzWzVdLkdldExldHRlclZhbHVlKCksIHNsb3RzWzZdLkdldExldHRlclZhbHVlKCksIHNsb3RzWzddLkdldExldHRlclZhbHVlKCkpO1xyXG4gICAgICAgICAgICB2YXIgd29yZDIgPSBzdHJpbmcuSm9pbihcIlwiLCBzbG90c1s4XS5HZXRMZXR0ZXJWYWx1ZSgpLCBzbG90c1s2XS5HZXRMZXR0ZXJWYWx1ZSgpLCBzbG90c1s5XS5HZXRMZXR0ZXJWYWx1ZSgpKTtcclxuICAgICAgICAgICAgcmV0dXJuIGdsb2JhbDo6QnJpZGdlLlNjcmlwdC5DYWxsRm9yKG5ldyBMaXN0PHN0cmluZz4oKSwoX28xKT0+e19vMS5BZGQod29yZDEpO19vMS5BZGQod29yZDIpO3JldHVybiBfbzE7fSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGJvb2wgSXNPblNsb3QoZG91YmxlIHgsIGRvdWJsZSB5LCBJU3ByaXRlIHNwcml0ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh4ID49IHNwcml0ZS54ICYmIHggPD0gKHNwcml0ZS54ICsgc3ByaXRlLndpZHRoKSAmJiB5ID49IHNwcml0ZS55ICYmIHkgPD0gKHNwcml0ZS55ICsgc3ByaXRlLmhlaWdodCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG5cclxubmFtZXNwYWNlIFdvcmRXb29wLkNvcmVcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEJvYXJkQnVpbGRlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBCb2FyZCBCdWlsZChJTGV0dGVyQnVpbGRlciBsZXR0ZXJCdWlsZGVyLCBJU2xvdEJ1aWxkZXIgc2xvdEJ1aWxkZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgc2xvdHMgPSBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuQ2FsbEZvcihuZXcgTGlzdDxTbG90PigpLChfbzEpPT57X28xLkFkZChzbG90QnVpbGRlci5CdWlsZCgwLCAwLCAxMDAsIDB4MDIxQTU5LCAweDRDNzBFMCkpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoMTIwLCAwLCAxMDAsIDB4MDIxQTU5LCAweDRDNzBFMCkpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoMjQwLCAwLCAxMDAsIDB4MDIxQTU5LCAweDRDNzBFMCkpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoMzYwLCAwLCAxMDAsIDB4MDIxQTU5LCAweDRDNzBFMCkpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoNDgwLCAwLCAxMDAsIDB4MDIxQTU5LCAweDRDNzBFMCkpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoMCwgMjQwLCAxMDAsIDB4MEYyOThELCAweDYxQTBGNikpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoMTIwLCAyNDAsIDEwMCwgMHgwRjI5OEQsIDB4NjFBMEY2KSk7X28xLkFkZChzbG90QnVpbGRlci5CdWlsZCgyNDAsIDI0MCwgMTAwLCAweDBGMjk4RCwgMHg2MUEwRjYpKTtfbzEuQWRkKHNsb3RCdWlsZGVyLkJ1aWxkKDEyMCwgMTIwLCAxMDAsIDB4MEYyOThELCAweDYxQTBGNikpO19vMS5BZGQoc2xvdEJ1aWxkZXIuQnVpbGQoMTIwLCAzNjAsIDEwMCwgMHgwRjI5OEQsIDB4NjFBMEY2KSk7cmV0dXJuIF9vMTt9KTtcclxuICAgICAgICAgICAgdmFyIGxldHRlcnMgPSBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuQ2FsbEZvcihuZXcgTGlzdDxMZXR0ZXI+KCksKF9vMik9PntfbzIuQWRkKGxldHRlckJ1aWxkZXIuQnVpbGQoXCJDXCIsIDAsIDApKTtfbzIuQWRkKGxldHRlckJ1aWxkZXIuQnVpbGQoXCJBXCIsIDAsIDApKTtfbzIuQWRkKGxldHRlckJ1aWxkZXIuQnVpbGQoXCJUXCIsIDAsIDApKTtfbzIuQWRkKGxldHRlckJ1aWxkZXIuQnVpbGQoXCJNXCIsIDAsIDApKTtfbzIuQWRkKGxldHRlckJ1aWxkZXIuQnVpbGQoXCJUXCIsIDAsIDApKTtyZXR1cm4gX28yO30pO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJvYXJkID0gbmV3IEJvYXJkKGxldHRlcnMsIHNsb3RzKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkNvdW50PGdsb2JhbDo6V29yZFdvb3AuQ29yZS5MZXR0ZXI+KGxldHRlcnMpOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLlB1dExldHRlck9uU2xvdEluaXRpYWxseShsZXR0ZXJzW2ldLCBzbG90c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiBib2FyZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIFdvcmRXb29wLkNvcmVcclxue1xyXG4gICAgcHVibGljIGNsYXNzIExldHRlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBMZXR0ZXIoSVNwcml0ZSBzcHJpdGUsIHN0cmluZyBsZXR0ZXJWYWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNwcml0ZSA9IHNwcml0ZTtcclxuICAgICAgICAgICAgTGV0dGVyVmFsdWUgPSBsZXR0ZXJWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBJU3ByaXRlIFNwcml0ZSB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIExldHRlclZhbHVlIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBXb3JkV29vcC5Db3JlXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBTbG90XHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIFNsb3QoSVNwcml0ZSBzcHJpdGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTcHJpdGUgPSBzcHJpdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcm9wTGV0dGVyKExldHRlciBsZXR0ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLkxldHRlciA9IGxldHRlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFRha2VMZXR0ZXIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5MZXR0ZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIElTcHJpdGUgU3ByaXRlIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG4gICAgICAgIHB1YmxpYyBMZXR0ZXIgTGV0dGVyIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEdldExldHRlclZhbHVlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLkxldHRlciA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiX1wiO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuTGV0dGVyLkxldHRlclZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGJvb2wgSGFzTGV0dGVyKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkxldHRlciAhPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuIiwiXHJcbm5hbWVzcGFjZSBXb3JkV29vcFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU3F1YXJlRHJhd2VyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhdyhSZXR5cGVkLnBoYXNlci5QaGFzZXIuR3JhcGhpY3MgZ3JhcGhpY3MsIGRvdWJsZSBib3JkZXJDb2xvdXIsIGRvdWJsZSBmaWxsQ29sb3VyLCBkb3VibGUgd2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBncmFwaGljcy5jbGVhcigpO1xyXG5cclxuICAgICAgICAgICAgZ3JhcGhpY3MuYmVnaW5GaWxsKGZpbGxDb2xvdXIpO1xyXG4gICAgICAgICAgICBncmFwaGljcy5saW5lU3R5bGUoMiwgYm9yZGVyQ29sb3VyLCAxKTtcclxuXHJcbiAgICAgICAgICAgIGdyYXBoaWNzLm1vdmVUbygwLCAwKTtcclxuICAgICAgICAgICAgZ3JhcGhpY3MubGluZVRvKHdpZHRoLCAwKTtcclxuICAgICAgICAgICAgZ3JhcGhpY3MubGluZVRvKHdpZHRoLCB3aWR0aCk7XHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmxpbmVUbygwLCB3aWR0aCk7XHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmxpbmVUbygwLCAwKTtcclxuXHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgV29yZFdvb3AuQ29yZTtcclxuXHJcbm5hbWVzcGFjZSBXb3JkV29vcFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgTGV0dGVyQnVpbGRlciA6IElMZXR0ZXJCdWlsZGVyXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSBnYW1lO1xyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgU3F1YXJlRHJhd2VyIHNxdWFyZURyYXdlcjtcclxuXHJcbiAgICAgICAgcHVibGljIExldHRlckJ1aWxkZXIoUmV0eXBlZC5waGFzZXIuUGhhc2VyLkdhbWUgZ2FtZSwgU3F1YXJlRHJhd2VyIHNxdWFyZURyYXdlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICAgICAgICAgIHRoaXMuc3F1YXJlRHJhd2VyID0gc3F1YXJlRHJhd2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIExldHRlciBCdWlsZChzdHJpbmcgbGV0dGVyLCBkb3VibGUgeCwgZG91YmxlIHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgZ3JhcGhpY3MgPSBnYW1lLmFkZC5ncmFwaGljcygwLCAwKTtcclxuXHJcbiAgICAgICAgICAgIHNxdWFyZURyYXdlci5EcmF3KGdyYXBoaWNzLCAweEZGRkZGRiwgMHgwRjI5OEQsIDkwKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gZ2FtZS5hZGQudGV4dCgwLCAwLCBsZXR0ZXIsIG5ldyB7IGZvbnQgPSBcIjM0cHggQXJpYWxcIiwgZmlsbCA9IFwiI2ZmZlwiIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmFuY2hvci5zZXQoMC41KTtcclxuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IGdhbWUuYWRkLnNwcml0ZSh4LCB5LCBncmFwaGljcy5nZW5lcmF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgICAgIHNwcml0ZS5hbmNob3Iuc2V0KDAuNSk7XHJcbiAgICAgICAgICAgIHNwcml0ZS5hZGRDaGlsZCh0ZXh0KTtcclxuXHJcbiAgICAgICAgICAgIHNwcml0ZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBzcHJpdGUuaW5wdXQuZW5hYmxlRHJhZyh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTGV0dGVyKG5ldyBTcHJpdGVXcmFwcGVyKHNwcml0ZSksIGxldHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFdvcmRXb29wLkNvcmU7XHJcblxyXG5uYW1lc3BhY2UgV29yZFdvb3Bcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFNsb3RCdWlsZGVyIDogSVNsb3RCdWlsZGVyXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBSZXR5cGVkLnBoYXNlci5QaGFzZXIuR2FtZSBnYW1lO1xyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgU3F1YXJlRHJhd2VyIHNxdWFyZURyYXdlcjtcclxuXHJcbiAgICAgICAgcHVibGljIFNsb3RCdWlsZGVyKFJldHlwZWQucGhhc2VyLlBoYXNlci5HYW1lIGdhbWUsIFNxdWFyZURyYXdlciBzcXVhcmVEcmF3ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4gICAgICAgICAgICB0aGlzLnNxdWFyZURyYXdlciA9IHNxdWFyZURyYXdlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBTbG90IEJ1aWxkKGRvdWJsZSB4LCBkb3VibGUgeSwgZG91YmxlIHdpZHRoLCBkb3VibGUgYm9yZGVyQ29sb3IsIGRvdWJsZSBiYWNrZ3JvdW5kQ29sb3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgZ3JhcGhpY3MgPSBnYW1lLmFkZC5ncmFwaGljcygwLCAwKTtcclxuICAgICAgICAgICAgc3F1YXJlRHJhd2VyLkRyYXcoZ3JhcGhpY3MsIGJvcmRlckNvbG9yLCBiYWNrZ3JvdW5kQ29sb3IsIHdpZHRoKTtcclxuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IGdhbWUuYWRkLnNwcml0ZSh4LCB5LCBncmFwaGljcy5nZW5lcmF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgICAgIGdyYXBoaWNzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTbG90KG5ldyBTcHJpdGVXcmFwcGVyKHNwcml0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBXb3JkV29vcC5Db3JlO1xyXG5cclxubmFtZXNwYWNlIFdvcmRXb29wXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBTcHJpdGVXcmFwcGVyIDogSVNwcml0ZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBTcHJpdGVXcmFwcGVyKFJldHlwZWQucGhhc2VyLlBoYXNlci5TcHJpdGUgc3ByaXRlKSBcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNwcml0ZSA9IHNwcml0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBSZXR5cGVkLnBoYXNlci5QaGFzZXIuU3ByaXRlIFNwcml0ZSB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cclxuICAgICAgICBwdWJsaWMgZG91YmxlIHgge1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFNwcml0ZS54O1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgc2V0XHJcbiAgICB7XHJcbiAgICAgICAgU3ByaXRlLnggPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG59ICAgICAgICBwdWJsaWMgZG91YmxlIHkge1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFNwcml0ZS55O1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgc2V0XHJcbiAgICB7XHJcbiAgICAgICAgU3ByaXRlLnkgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG59ICAgICAgICBwdWJsaWMgZG91YmxlIHdpZHRoIHtcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBTcHJpdGUud2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBzZXRcclxuICAgIHtcclxuICAgICAgICBTcHJpdGUud2lkdGggPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG59ICAgICAgICBwdWJsaWMgZG91YmxlIGhlaWdodCB7XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gU3ByaXRlLmhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIHNldFxyXG4gICAge1xyXG4gICAgICAgIFNwcml0ZS5oZWlnaHQgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG59ICAgICAgICBwdWJsaWMgZG91YmxlIGFuY2hvclgge1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFNwcml0ZS5hbmNob3IueDtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIHNldFxyXG4gICAge1xyXG4gICAgICAgIFNwcml0ZS5hbmNob3IueCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbn0gICAgICAgIHB1YmxpYyBkb3VibGUgYW5jaG9yWSB7XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gU3ByaXRlLmFuY2hvci55O1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgc2V0XHJcbiAgICB7XHJcbiAgICAgICAgU3ByaXRlLmFuY2hvci55ID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBcclxufSAgICB9XHJcbn1cclxuIiwidXNpbmcgV29yZFdvb3AuQ29yZTtcclxuXHJcbm5hbWVzcGFjZSBXb3JkV29vcFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgV29yZFdvb3BHYW1lIDogQWJzdHJhY3RHYW1lU3RhdGVcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5HcmFwaGljcyBncmFwaGljcztcclxuICAgICAgICBwcml2YXRlIEJvYXJkIGJvYXJkO1xyXG4gICAgICAgIHByaXZhdGUgUmV0eXBlZC5waGFzZXIuUGhhc2VyLlRleHQgd2luVGV4dDtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5UZXh0IHByaXplVGV4dDtcclxuICAgICAgICBwcml2YXRlIFJldHlwZWQucGhhc2VyLlBoYXNlci5UZXh0IGRlYnVnVGV4dDtcclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgUHJlbG9hZCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnYW1lLmxvYWQuY3Jvc3NPcmlnaW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBnYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiI0ZBRkFGQVwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgQ3JlYXRlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBib2FyZEJ1aWxkZXIgPSBuZXcgQm9hcmRCdWlsZGVyKCk7XHJcbiAgICAgICAgICAgIHZhciBzcXVhcmVEcmF3ZXIgPSBuZXcgU3F1YXJlRHJhd2VyKCk7XHJcbiAgICAgICAgICAgIHZhciBsZXR0ZXJCdWlsZGVyID0gbmV3IExldHRlckJ1aWxkZXIoZ2FtZSwgc3F1YXJlRHJhd2VyKTtcclxuICAgICAgICAgICAgdmFyIHNsb3RCdWlsZGVyID0gbmV3IFNsb3RCdWlsZGVyKGdhbWUsIHNxdWFyZURyYXdlcik7XHJcbiAgICAgICAgICAgIGJvYXJkID0gYm9hcmRCdWlsZGVyLkJ1aWxkKGxldHRlckJ1aWxkZXIsIHNsb3RCdWlsZGVyKTtcclxuXHJcbiAgICAgICAgICAgIGJvYXJkLmxldHRlcnMuRm9yRWFjaCgoZ2xvYmFsOjpTeXN0ZW0uQWN0aW9uPGdsb2JhbDo6V29yZFdvb3AuQ29yZS5MZXR0ZXI+KSh4ID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdyA9IHguU3ByaXRlIGFzIFNwcml0ZVdyYXBwZXI7XHJcbiAgICAgICAgICAgICAgICBzdy5TcHJpdGUuZXZlbnRzLm9uRHJhZ1N0YXJ0LmFkZCgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxvYmplY3Q+KSgoKSA9PiBzdy5TcHJpdGUuYnJpbmdUb1RvcCgpKSk7XHJcbiAgICAgICAgICAgICAgICBzdy5TcHJpdGUuZXZlbnRzLm9uRHJhZ1N0b3AuYWRkKChnbG9iYWw6OlN5c3RlbS5BY3Rpb24pKCgpID0+XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgRHJvcHBlZCh4KTtcclxuICAgICAgICAgICAgICAgIH0pLCB0aGlzKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB3aW5UZXh0ID0gZ2FtZS5hZGQudGV4dCg2MDAsIDAsIFwiV0lOIVwiLCBuZXcgeyBmb250ID0gXCIzNHB4IEFyaWFsXCIsIGZpbGwgPSBcIiMwMDBcIiwgdmlzaWJsZT1cImZhbHNlXCIgfSk7XHJcbiAgICAgICAgICAgIHByaXplVGV4dCA9IGdhbWUuYWRkLnRleHQoNjAwLCA1MiwgXCJQcml6ZSBDb2RlOiAxMDBUUk9OXCIsIG5ldyB7IGZvbnQgPSBcIjE4cHggQXJpYWxcIiwgZmlsbCA9IFwiIzAwMFwiLCB2aXNpYmxlID0gXCJmYWxzZVwiIH0pO1xyXG4gICAgICAgICAgICBkZWJ1Z1RleHQgPSBnYW1lLmFkZC50ZXh0KDAsIDU4MCwgXCJERUJVR1wiLCBuZXcgeyBmb250ID0gXCIxMHB4IEFyaWFsXCIsIGZpbGwgPSBcIiMwMDBcIiB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyb3BwZWQoTGV0dGVyIGxldHRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBwb2ludGVyID0gZ2FtZS5pbnB1dC5hY3RpdmVQb2ludGVyO1xyXG4gICAgICAgICAgICBib2FyZC5MZXR0ZXJEcm9wcGVkKHBvaW50ZXIueCwgcG9pbnRlci55LCBsZXR0ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgVXBkYXRlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBSZW5kZXIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGFuc3dlcnMgPSBib2FyZC5HZXRXb3JkcygpO1xyXG4gICAgICAgICAgICBkZWJ1Z1RleHQudGV4dCA9IHN0cmluZy5Gb3JtYXQoXCJBbnN3ZXJzOiB7MH18ezF9XCIsYW5zd2Vyc1swXSxhbnN3ZXJzWzFdKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChib2FyZC5Jc1dvbigpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB3aW5UZXh0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJpemVUZXh0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgd2luVGV4dC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBwcml6ZVRleHQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgUmVzdGFydCgpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXQp9Cg==
