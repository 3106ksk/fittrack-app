const axios = require('axios');

console.log("=== AxiosError オブジェクト構造とinstanceof解析 ===\n");

// 1. AxiosErrorクラスの基本情報を調査
function analyzeAxiosErrorClass() {
  console.log("【1. AxiosErrorクラスの基本情報】");
  console.log("AxiosError:", typeof axios.AxiosError);
  console.log("AxiosError.name:", axios.AxiosError.name);
  console.log("AxiosError.prototype:", typeof axios.AxiosError.prototype);
  
  // プロトタイプチェーンの確認
  console.log("\n📊 プロトタイプチェーン:");
  console.log("AxiosError.prototype.constructor.name:", axios.AxiosError.prototype.constructor.name);
  console.log("Object.getPrototypeOf(axios.AxiosError.prototype):", Object.getPrototypeOf(axios.AxiosError.prototype).constructor.name);
  console.log();
}

// 2. 実際のAxiosErrorオブジェクトを生成して解析
async function generateAndAnalyzeAxiosError() {
  console.log("【2. 実際のAxiosErrorオブジェクト生成】");
  
  try {
    // 意図的にエラーを発生させる
    await axios.get('http://localhost:9999/nonexistent', {
      timeout: 1000
    });
  } catch (error) {
    console.log("✅ エラーが発生しました");
    
    // instanceof チェックの詳細分析
    console.log("\n🔍 instanceof チェック詳細:");
    console.log("error instanceof axios.AxiosError:", error instanceof axios.AxiosError);
    console.log("error instanceof Error:", error instanceof Error);
    console.log("error instanceof Object:", error instanceof Object);
    
    // オブジェクトの基本情報
    console.log("\n📋 オブジェクト基本情報:");
    console.log("error.constructor.name:", error.constructor.name);
    console.log("error.name:", error.name);
    console.log("typeof error:", typeof error);
    
    // プロトタイプチェーンの確認
    console.log("\n🔗 プロトタイプチェーン:");
    let proto = Object.getPrototypeOf(error);
    let level = 0;
    while (proto && level < 5) {
      console.log(`レベル ${level}: ${proto.constructor.name}`);
      proto = Object.getPrototypeOf(proto);
      level++;
    }
    
    // AxiosErrorの特有プロパティ
    console.log("\n📦 AxiosError特有プロパティ:");
    console.log("├─ error.code:", error.code);
    console.log("├─ error.config:", typeof error.config);
    console.log("├─ error.request:", typeof error.request);
    console.log("├─ error.response:", typeof error.response);
    console.log("├─ error.isAxiosError:", error.isAxiosError);
    console.log("└─ error.toJSON:", typeof error.toJSON);
    
    // 継承元Errorクラスのプロパティ
    console.log("\n📦 継承元Errorプロパティ:");
    console.log("├─ error.name:", error.name);
    console.log("├─ error.message:", error.message);
    console.log("└─ error.stack:", error.stack ? "あり" : "なし");
    
    // 完全なオブジェクト構造の表示
    console.log("\n📊 完全なAxiosErrorオブジェクト構造:");
    const errorStructure = {
      // AxiosError特有プロパティ
      isAxiosError: error.isAxiosError,
      code: error.code,
      config: error.config ? "Request Config Object" : undefined,
      request: error.request ? "Request Object" : undefined,
      response: error.response ? "Response Object" : undefined,
      
      // Error継承プロパティ  
      name: error.name,
      message: error.message,
      stack: error.stack ? "Stack Trace String" : undefined,
      
      // オブジェクトメタ情報
      constructor: error.constructor.name,
      typeof: typeof error
    };
    console.log(JSON.stringify(errorStructure, null, 2));
    
    return error;
  }
}

// 3. responseありのAxiosErrorを生成
async function generateResponseAxiosError() {
  console.log("\n" + "=".repeat(60));
  console.log("【3. error.responseありのAxiosError】");
  
  try {
    // サーバーからエラーレスポンスを受信
    await axios.get('http://localhost:8000/authrouter/me', {
      headers: {
        'Authorization': 'Bearer invalid_token'
      }
    });
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      console.log("✅ AxiosError として認識");
      
      console.log("\n📋 error.response の存在確認:");
      console.log("error.response:", !!error.response);
      
      if (error.response) {
        console.log("\n📦 error.response の構造:");
        console.log("├─ status:", error.response.status);
        console.log("├─ statusText:", error.response.statusText);
        console.log("├─ data:", JSON.stringify(error.response.data));
        console.log("├─ headers:", typeof error.response.headers);
        console.log("└─ config:", typeof error.response.config);
        
        // 条件式の動作確認
        console.log("\n🔍 条件式の評価:");
        console.log("error instanceof axios.AxiosError:", error instanceof axios.AxiosError);
        console.log("error.response:", !!error.response);
        console.log("(error instanceof axios.AxiosError && error.response):", 
                   (error instanceof axios.AxiosError && error.response));
      }
    }
  }
}

// 4. なぜinstanceofがtrueになるのかの詳細解説
function explainInstanceofMechanism() {
  console.log("\n" + "=".repeat(60));
  console.log("【4. instanceof演算子の動作メカニズム】\n");
  
  console.log("💡 instanceof の判定プロセス:");
  console.log("1. error.__proto__ === axios.AxiosError.prototype をチェック");
  console.log("2. false の場合、error.__proto__.__proto__ をチェック");
  console.log("3. プロトタイプチェーンを辿って一致するまで繰り返し");
  console.log("4. 一致が見つかれば true、なければ false");
  
  console.log("\n📊 AxiosError のプロトタイプチェーン:");
  console.log("error (AxiosErrorインスタンス)");
  console.log("  ↓ __proto__");
  console.log("AxiosError.prototype");
  console.log("  ↓ __proto__");  
  console.log("Error.prototype");
  console.log("  ↓ __proto__");
  console.log("Object.prototype");
  console.log("  ↓ __proto__");
  console.log("null");
  
  console.log("\n✅ だから以下がすべて true になる:");
  console.log("• error instanceof axios.AxiosError → true");
  console.log("• error instanceof Error → true");
  console.log("• error instanceof Object → true");
}

// 実行
async function runAnalysis() {
  analyzeAxiosErrorClass();
  await generateAndAnalyzeAxiosError();
  await generateResponseAxiosError();
  explainInstanceofMechanism();
}

runAnalysis().catch(console.error); 