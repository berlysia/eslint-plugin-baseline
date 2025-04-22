import * as ts from "typescript";

export function createIsTargetType(
	typeChecker: ts.TypeChecker,
	targetName: string,
): (type: ts.Type) => boolean {
	const targetSymbol = typeChecker.resolveName(
		targetName,
		/* location */ undefined,
		ts.SymbolFlags.All,
		/* excludeGlobals */ false,
	);

	const targetType =
		targetSymbol && typeChecker.getDeclaredTypeOfSymbol(targetSymbol);

	return function isTargetType(type: ts.Type): boolean {
		const symbol = type.getSymbol();
		if (!symbol) return false;

		// 直接型チェック
		if (symbol === targetSymbol) return true;

		// Union型のチェック
		if (type.isUnion() && type.types.some((t) => isTargetType(t))) {
			return true;
		}

		// 継承チェック
		if (type.getBaseTypes()?.some((t) => isTargetType(t))) {
			return true;
		}

		// 代入可能性のチェック
		if (targetType && typeChecker.isTypeAssignableTo(type, targetType)) {
			return true;
		}

		return false;
	};
}
