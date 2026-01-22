import Lexer from "./lexer/Lexer";
import Parser from "./parser/Parser";
import SemanticAnalyzer from "./semantic/Semantic";
import { Preprocessor } from "./Preprocessador/processador";

import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, "input", "code.nt");
const rawCode = fs.readFileSync(filePath, "utf-8");

const preprocessor = new Preprocessor([path.join(__dirname, "input")]);
const cleanCode = preprocessor.processFile(filePath);

fs.writeFileSync(filePath + ".pp", cleanCode);

const lexer = new Lexer(cleanCode);
const parser = new Parser(lexer);
const ast = parser.parse();

const semantic = new SemanticAnalyzer();
semantic.execute(ast);
