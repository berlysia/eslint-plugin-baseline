import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createSharedValidator } from "./sharedValidator.ts";

/**
 * インスタンスメソッドの引数のプロパティを検証するバリデータを作成
 */
export function createInstanceMethodArgumentPropertyValidator({
  typeName,
  constructorTypeName,
  methodName,
  argumentIndex,
  optionProperty,
}: {
  typeName: string;
  constructorTypeName: string;
  methodName: string;
  argumentIndex: number;
  optionProperty: string;
}) {
  return function create<
    MessageIds extends string,
    Options extends readonly unknown[],
  >(
    context: RuleContext<MessageIds, Options>,
    seed: RuleModuleSeed,
    config: BaselineRuleConfig,
  ) {
    const sharedValidator = createSharedValidator(
      typeName,
      constructorTypeName,
      context,
      seed,
      config,
    );

    return {
      "CallExpression[callee.type='MemberExpression']"(
        node: TSESTree.CallExpression & {
          callee: TSESTree.MemberExpression;
        },
      ) {
        const { callee } = node;
        if (
          callee.property.type === "Identifier" &&
          callee.property.name === methodName &&
          (sharedValidator.validateInstanceType(callee.object) ||
            (callee.object.type === "MemberExpression" &&
              callee.object.property.type === "Identifier" &&
              callee.object.property.name === "prototype" &&
              sharedValidator.validateConstructorType(callee.object.object))) &&
          sharedValidator.isArgumentHasTheProperty(
            node.arguments,
            argumentIndex,
            optionProperty,
          )
        ) {
          sharedValidator.report(node);
        }
      },
    };
  };
}
/**
 * インスタンスメソッドの引数の型を検証するバリデータを作成
 */
export function createInstanceMethodArgumentTypeValidator({
  typeName,
  constructorTypeName,
  methodName,
  argumentIndex,
  expectedType,
}: {
  typeName: string;
  constructorTypeName: string;
  methodName: string;
  argumentIndex: number;
  expectedType: string;
}) {
  return function create<
    MessageIds extends string,
    Options extends readonly unknown[],
  >(
    context: RuleContext<MessageIds, Options>,
    seed: RuleModuleSeed,
    config: BaselineRuleConfig,
  ) {
    const sharedValidator = createSharedValidator(
      typeName,
      constructorTypeName,
      context,
      seed,
      config,
    );

    return {
      "CallExpression[callee.type='MemberExpression']"(
        node: TSESTree.CallExpression & {
          callee: TSESTree.MemberExpression;
        },
      ) {
        const { callee } = node;
        if (
          callee.property.type === "Identifier" &&
          callee.property.name === methodName &&
          (sharedValidator.validateInstanceType(callee.object) ||
            (callee.object.type === "MemberExpression" &&
              callee.object.property.type === "Identifier" &&
              callee.object.property.name === "prototype" &&
              sharedValidator.validateConstructorType(callee.object.object))) &&
          sharedValidator.isArgumentOfType(
            node.arguments,
            argumentIndex,
            expectedType,
          )
        ) {
          sharedValidator.report(node);
        }
      },
    };
  };
}
/**
 * インスタンスメソッドの引数がパターンにマッチするかを検証するバリデータを作成
 */
export function createInstanceMethodArgumentPatternValidator({
  typeName,
  constructorTypeName,
  methodName,
  argumentIndex,
  pattern,
}: {
  typeName: string;
  constructorTypeName: string;
  methodName: string;
  argumentIndex: number;
  pattern: RegExp | string;
}) {
  return function create<
    MessageIds extends string,
    Options extends readonly unknown[],
  >(
    context: RuleContext<MessageIds, Options>,
    seed: RuleModuleSeed,
    config: BaselineRuleConfig,
  ) {
    const sharedValidator = createSharedValidator(
      typeName,
      constructorTypeName,
      context,
      seed,
      config,
    );

    return {
      "CallExpression[callee.type='MemberExpression']"(
        node: TSESTree.CallExpression & {
          callee: TSESTree.MemberExpression;
        },
      ) {
        const { callee } = node;
        if (
          callee.property.type === "Identifier" &&
          callee.property.name === methodName &&
          (sharedValidator.validateInstanceType(callee.object) ||
            (callee.object.type === "MemberExpression" &&
              callee.object.property.type === "Identifier" &&
              callee.object.property.name === "prototype" &&
              sharedValidator.validateConstructorType(callee.object.object))) &&
          sharedValidator.isArgumentMatchPattern(
            node.arguments,
            argumentIndex,
            pattern,
          )
        ) {
          sharedValidator.report(node);
        }
      },
    };
  };
}

/**
 * インスタンスメソッドの存在を検証するバリデータ
 * 
 * 様々なJavaScript/TypeScriptパターンに対応した高度なバリデータ。
 * 以下のようなアクセスパターンを検出できます：
 * 
 * - 通常のインスタンスメソッド呼び出し: obj.method()
 * - 計算プロパティによるアクセス: obj["method"]()、obj[prop]()
 * - apply/callパターン: obj.method.call(obj)、obj.method.apply(obj, [])
 * - 分割代入パターン: const { method } = obj; method()
 * - メソッド参照の変数経由の呼び出し: const fn = obj.method; fn()
 * - 配列リテラルからのメソッド呼び出し: [].method.call(obj) （Array特有）
 * - 関数内での呼び出し: function process(obj) { obj.method() }
 * 
 * 実装の特徴：
 * - 変数参照の追跡による間接的な呼び出しの検出
 * - 重複報告防止機能
 * - TypeScriptの型情報を活用した高精度な検出
 * - 配列リテラルメソッドの特殊対応
 */
export function createInstanceMethodValidator({
  typeName,
  constructorTypeName,
  methodName,
}: {
  typeName: string;
  constructorTypeName: string;
  methodName: string;
}) {
  return function create<
    MessageIds extends string,
    Options extends readonly unknown[],
  >(
    context: RuleContext<MessageIds, Options>,
    seed: RuleModuleSeed,
    config: BaselineRuleConfig,
  ) {
    const sharedValidator = createSharedValidator(
      typeName,
      constructorTypeName,
      context,
      seed,
      config,
    );

    /**
     * 重複報告を防ぐためのセット
     * 特にcall/applyパターンでは、同じメソッド参照を複数回検出する可能性があるため
     * 検出済みのノードを記録して重複報告を防止する
     */
    const reportedNodes = new Set<TSESTree.Node>();
    
    /**
     * 変数名とその定義をトラッキングするマップ
     * キー: 変数名
     * 値: {
     *   originNode: 元のメソッド参照ノード
     *   fromType: 参照元の種類 ("instance", "prototype", "destructured", "array_literal")
     * }
     */
    const methodReferences = new Map<string, { originNode: TSESTree.Node; fromType: string }>();
    
    /**
     * Array literalからのメソッド呼び出しを追跡するセット
     * [].slice.call(arguments) のようなパターンを検出するために使用
     * 配列リテラル+メソッド参照の組み合わせを一意に識別するキーを格納
     */
    const arrayLiteralMethodCalls = new Set<string>();

    function reportOnce(node: TSESTree.Node) {
      if (!reportedNodes.has(node)) {
        reportedNodes.add(node);
        sharedValidator.report(node);
      }
    }

    /**
     * 文字列リテラルかどうかを判定する（型情報も使用）
     * 直接的なリテラル（"method"）だけでなく、
     * 型情報を使って変数の値が特定の文字列かどうかも判定する
     * 
     * @param node 判定対象のノード
     * @param value 期待する文字列値
     * @returns 指定の値を持つ文字列リテラルならtrue
     */
    function isStringLiteralWithValue(node: TSESTree.Node, value: string): boolean {
      // 直接的なリテラルのケース
      if (node.type === "Literal" && typeof node.value === "string" && node.value === value) {
        return true;
      }

      // TypeScriptの型情報を使用した判定（const prop = "method"など）
      try {
        if ('type' in node) {
          const tsNode = sharedValidator.services.esTreeNodeToTSNodeMap.get(node);
          if (tsNode) {
            const type = sharedValidator.typeChecker.getTypeAtLocation(tsNode);
            return Boolean(type && type.isStringLiteral && type.isStringLiteral() && type.value === value);
          }
        }
      } catch (e) {
        // 型情報の取得に失敗した場合は無視
      }

      return false;
    }

    /**
     * 対象のメソッドを参照した変数の定義を追跡する
     * メソッド参照を変数に格納するパターンに対応するために使用
     * 
     * @param variableName 追跡する変数名
     * @param originNode 元のメソッド参照ノード
     * @param fromType メソッド参照元の種類（"instance", "prototype", "destructured", "array_literal"）
     */
    function trackMethodReference(variableName: string, originNode: TSESTree.Node, fromType: string): void {
      methodReferences.set(variableName, { originNode, fromType });
    }

    /**
     * 識別子が追跡対象のメソッド参照かどうか判定する
     * 
     * @param identifier 判定する識別子ノード
     * @returns メソッド参照として追跡されている場合はtrue
     */
    function isMethodReference(identifier: TSESTree.Identifier): boolean {
      return methodReferences.has(identifier.name);
    }

    /**
     * 配列リテラルのメソッドアクセスを判定する
     * 例: [].slice, [1,2,3].slice, []["slice"]
     * 
     * @param node メンバーアクセス式のノード
     * @returns 配列リテラルのメソッドアクセスならtrue
     */
    function isArrayLiteralMethod(node: TSESTree.MemberExpression): boolean {
      return (
        node.object.type === "ArrayExpression" &&
        (
          // [].method - 識別子による直接アクセス
          (node.property.type === "Identifier" && node.property.name === methodName) ||
          // []["method"] - 文字列リテラルによる計算プロパティアクセス
          isStringLiteralWithValue(node.property, methodName)
        )
      );
    }

    /**
     * 配列リテラルメソッドの一意識別キーを生成する
     * ノードの位置情報を使用して一意のキーを作成
     * 
     * @param memberExpr メンバーアクセス式のノード
     * @returns ユニークな識別キー
     */
    function getArrayLiteralCallKey(memberExpr: TSESTree.MemberExpression): string {
      return `array_literal_${memberExpr.range[0]}_${memberExpr.range[1]}`;
    }

    /**
     * 配列リテラルメソッドを追跡リストに登録する
     * 特に[].method.call()パターン検出のために使用
     * 
     * @param memberExpr 追跡する配列リテラルメソッドのノード
     */
    function trackArrayLiteralMethod(memberExpr: TSESTree.MemberExpression): void {
      const key = getArrayLiteralCallKey(memberExpr);
      arrayLiteralMethodCalls.add(key);
    }

    /**
     * 指定の配列リテラルメソッドが既に追跡リストに登録されているかをチェック
     * 
     * @param memberExpr チェックするメンバーアクセス式
     * @returns 追跡済みの場合はtrue
     */
    function isTrackedArrayLiteralMethod(memberExpr: TSESTree.MemberExpression): boolean {
      const key = getArrayLiteralCallKey(memberExpr);
      return arrayLiteralMethodCalls.has(key);
    }

    return {
      // 変数定義を追跡 - const method = obj.targetMethod
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          node.id.type === "Identifier" &&
          node.init &&
          node.init.type === "MemberExpression" 
        ) {
          // 配列リテラルメソッド参照の場合: const slice = [].slice
          if (isArrayLiteralMethod(node.init)) {
            // typeName が Array の場合のみ対象とする
            if (typeName === "Array") {
              trackMethodReference(node.id.name, node.init, "array_literal");
              reportOnce(node.init);
            }
          }
          // 通常のメソッド参照
          else if (
            // obj.method
            (node.init.property.type === "Identifier" && node.init.property.name === methodName) ||
            // obj["method"]
            isStringLiteralWithValue(node.init.property, methodName)
          ) {
            // 対象のインスタンスからのメソッド参照の場合
            if (sharedValidator.validateInstanceType(node.init.object)) {
              trackMethodReference(node.id.name, node.init, "instance");
              reportOnce(node.init);
            }
            // Constructor.prototypeからのメソッド参照の場合
            else if (
              node.init.object.type === "MemberExpression" &&
              node.init.object.property.type === "Identifier" &&
              node.init.object.property.name === "prototype" &&
              sharedValidator.validateConstructorType(node.init.object.object)
            ) {
              trackMethodReference(node.id.name, node.init, "prototype");
              reportOnce(node.init);
            }
          }
        }
      },

      // 分割代入を追跡 - const { method } = obj
      ObjectPattern(node: TSESTree.ObjectPattern) {
        const parent = node.parent as TSESTree.VariableDeclarator | undefined;
        if (!parent || parent.type !== "VariableDeclarator" || !parent.init) return;

        // 分割代入元が対象インスタンスかチェック
        const isFromTargetInstance = sharedValidator.validateInstanceType(parent.init);
        if (!isFromTargetInstance) return;

        // methodNameに一致するプロパティを探す
        for (const prop of node.properties) {
          if (prop.type !== "Property") continue;

          // 識別子プロパティ: const { method } = obj
          if (
            prop.key.type === "Identifier" && 
            prop.key.name === methodName &&
            prop.value.type === "Identifier"
          ) {
            trackMethodReference(prop.value.name, prop.key, "destructured");
            reportOnce(prop.key);
          }
          // 計算プロパティ: const { ["method"]: alias } = obj
          else if (
            prop.computed &&
            isStringLiteralWithValue(prop.key, methodName) &&
            prop.value.type === "Identifier"
          ) {
            trackMethodReference(prop.value.name, prop.key, "destructured");
            reportOnce(prop.key);
          }
        }
      },

      // メンバー式 - obj.method, obj["method"], obj[prop]
      MemberExpression(node: TSESTree.MemberExpression) {
        // 配列リテラルメソッド - [].method
        if (typeName === "Array" && isArrayLiteralMethod(node)) {
          // call/applyパターンの一部として扱われる場合はここでは報告しない
          if (
            node.parent &&
            node.parent.type === "MemberExpression" &&
            node.parent.object === node &&
            node.parent.property.type === "Identifier" &&
            (node.parent.property.name === "call" || node.parent.property.name === "apply")
          ) {
            trackArrayLiteralMethod(node);
            return;
          }
          
          reportOnce(node);
          return;
        }

        // Skip if this is part of a .call/.apply pattern
        if (
          node.parent &&
          node.parent.type === "MemberExpression" &&
          node.parent.object === node &&
          node.parent.property.type === "Identifier" &&
          (node.parent.property.name === "call" || node.parent.property.name === "apply")
        ) {
          return;
        }

        // 通常のプロパティアクセス: obj.method
        if (
          node.property.type === "Identifier" &&
          node.property.name === methodName
        ) {
          // インスタンスメソッド: instance.method
          if (sharedValidator.validateInstanceType(node.object)) {
            reportOnce(node);
          }
          // プロトタイプメソッド: Constructor.prototype.method
          else if (
            node.object.type === "MemberExpression" &&
            node.object.property.type === "Identifier" &&
            node.object.property.name === "prototype" &&
            sharedValidator.validateConstructorType(node.object.object)
          ) {
            reportOnce(node);
          }
        }
        // 文字列リテラルプロパティ: obj["method"]
        else if (
          isStringLiteralWithValue(node.property, methodName)
        ) {
          // インスタンスメソッド: instance["method"]
          if (sharedValidator.validateInstanceType(node.object)) {
            reportOnce(node);
          }
          // プロトタイプメソッド: Constructor.prototype["method"]
          else if (
            node.object.type === "MemberExpression" &&
            node.object.property.type === "Identifier" &&
            node.object.property.name === "prototype" &&
            sharedValidator.validateConstructorType(node.object.object)
          ) {
            reportOnce(node);
          }
        }
      },

      // call/apply パターン: obj.method.call(obj, arg), obj.method.apply(obj, [arg])
      "CallExpression[callee.type='MemberExpression']"(
        node: TSESTree.CallExpression & { callee: TSESTree.MemberExpression }
      ) {
        const { callee } = node;

        // call / applyメソッド呼び出し: func.call(this, args) / func.apply(this, args)
        if (
          callee.property.type === "Identifier" &&
          (callee.property.name === "call" || callee.property.name === "apply")
        ) {
          // メソッド参照を変数に代入したケース: methodRef.call(obj, args)
          if (
            callee.object.type === "Identifier" && 
            isMethodReference(callee.object) &&
            node.arguments.length > 0
          ) {
            const methodRef = methodReferences.get(callee.object.name);
            if (methodRef && (
              methodRef.fromType === "array_literal" || 
              sharedValidator.validateInstanceType(node.arguments[0] as TSESTree.Expression)
            )) {
              reportOnce(methodRef.originNode);
            }
          }
          // 直接的なメソッド呼び出し
          else if (
            callee.object.type === "MemberExpression" &&
            node.arguments.length > 0
          ) {
            // 配列リテラルメソッド呼び出し: [].method.call(obj, args)
            if (typeName === "Array" && isTrackedArrayLiteralMethod(callee.object)) {
              reportOnce(callee.object);
            }
            // 標準的なメソッド呼び出し: obj.method.call(obj, args) / proto.method.call(obj, args)
            else if (
              (
                // obj.method.call
                (callee.object.property.type === "Identifier" && callee.object.property.name === methodName) ||
                // obj["method"].call
                isStringLiteralWithValue(callee.object.property, methodName)
              )
            ) {
              // プロトタイプメソッド: Constructor.prototype.method.call(instance)
              if (
                callee.object.object.type === "MemberExpression" &&
                callee.object.object.property.type === "Identifier" &&
                callee.object.object.property.name === "prototype" &&
                sharedValidator.validateConstructorType(callee.object.object.object)
              ) {
                reportOnce(callee.object);
              }
              // 特殊なケース: [].method.call(obj) - 配列リテラルからのメソッド呼び出し
              else if (typeName === "Array" && callee.object.object.type === "ArrayExpression") {
                reportOnce(callee.object);
              }
              // 他のメソッド参照経由の呼び出し
              else if (sharedValidator.validateInstanceType(callee.object.object)) {
                reportOnce(callee.object);
              }
            }
          }
        }
      },

      // 変数経由の直接呼び出し: const methodRef = obj.method; methodRef()
      "CallExpression[callee.type='Identifier']"(
        node: TSESTree.CallExpression & { callee: TSESTree.Identifier }
      ) {
        const { callee } = node;
        if (isMethodReference(callee)) {
          const methodRef = methodReferences.get(callee.name);
          if (methodRef) {
            reportOnce(methodRef.originNode);
          }
        }
      }
    };
  };
}

export function createInstancePropertyValidator({
  typeName,
  constructorTypeName,
  propertyName,
}: {
  typeName: string;
  constructorTypeName: string;
  propertyName: string;
}) {
  return function create<
    MessageIds extends string,
    Options extends readonly unknown[],
  >(
    context: RuleContext<MessageIds, Options>,
    seed: RuleModuleSeed,
    config: BaselineRuleConfig,
  ) {
    const sharedValidator = createSharedValidator(
      typeName,
      constructorTypeName,
      context,
      seed,
      config,
    );

    return {
      MemberExpression(node: TSESTree.MemberExpression) {
        if (
          node.property.type === "Identifier" &&
          node.property.name === propertyName &&
          sharedValidator.validateInstanceType(node.object)
        ) {
          sharedValidator.report(node);
        }
      },
    };
  };
}

/**
 * インスタンスメソッドの引数の存在を検証するバリデータを作成
 */
export function createInstanceMethodArgumentExistsValidator({
  typeName,
  constructorTypeName,
  methodName,
  argumentIndex,
}: {
  typeName: string;
  constructorTypeName: string;
  methodName: string;
  argumentIndex: number;
}) {
  return function create<
    MessageIds extends string,
    Options extends readonly unknown[],
  >(
    context: RuleContext<MessageIds, Options>,
    seed: RuleModuleSeed,
    config: BaselineRuleConfig,
  ) {
    const sharedValidator = createSharedValidator(
      typeName,
      constructorTypeName,
      context,
      seed,
      config,
    );

    return {
      "CallExpression[callee.type='MemberExpression']"(
        node: TSESTree.CallExpression & {
          callee: TSESTree.MemberExpression;
        },
      ) {
        const { callee } = node;
        // ${instance}.${methodName}(...args)
        if (
          callee.property.type === "Identifier" &&
          callee.property.name === methodName &&
          sharedValidator.validateInstanceType(callee.object) &&
          sharedValidator.argumentExists(node.arguments, argumentIndex)
        ) {
          sharedValidator.report(node);
        }

        // ${Constructor}.prototype.${methodName}.call(this, ...args)
        if (
          callee.property.type === "Identifier" &&
          callee.property.name === "call" &&
          callee.object.type === "MemberExpression" &&
          callee.object.property.type === "Identifier" &&
          callee.object.property.name === methodName &&
          callee.object.object.type === "MemberExpression" &&
          callee.object.object.property.type === "Identifier" &&
          callee.object.object.property.name === "prototype" &&
          sharedValidator.validateConstructorType(
            callee.object.object.object,
          ) &&
          sharedValidator.argumentExists(node.arguments, argumentIndex + 1)
        ) {
          sharedValidator.report(node);
        }

        // FIXME: ${Constructor}.prototype.${methodName}.apply(this, args)
      },
    };
  };
}