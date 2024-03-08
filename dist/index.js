"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestMatch = exports.Translation = exports.TranslationStrategy = exports.Wolpertinger = void 0;
var wolpertinger_1 = require("./wolpertinger");
Object.defineProperty(exports, "Wolpertinger", { enumerable: true, get: function () { return wolpertinger_1.Wolpertinger; } });
var translation_strategy_1 = require("./translation-strategy");
Object.defineProperty(exports, "TranslationStrategy", { enumerable: true, get: function () { return translation_strategy_1.TranslationStrategy; } });
Object.defineProperty(exports, "Translation", { enumerable: true, get: function () { return translation_strategy_1.Translation; } });
Object.defineProperty(exports, "BestMatch", { enumerable: true, get: function () { return translation_strategy_1.BestMatch; } });
