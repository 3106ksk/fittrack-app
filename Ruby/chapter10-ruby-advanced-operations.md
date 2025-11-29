# 10章 Rubyを使った複雑な操作(1)

## Rubyを使った通信とエラーハンドリング

### リクエストとレスポンス

Webアプリケーションは、クライアント（ブラウザやモバイルアプリなど）とサーバーが通信することで動作します。

この通信は「リクエスト」と「レスポンス」という形で行われます。クライアントがサーバーに対して情報を要求することを「リクエスト」、サーバーがその要求に対して情報を返すことを「レスポンス」と言います。

### HTTPを使ったリクエストとレスポンス

HTTPリクエストは、主に以下の部分から構成されます。

- **HTTPメソッド**: リクエストの種類を示します（例: GET, POST, PUT, DELETE）。
- **URL**: アクセスしたい場所を示します。
- **HTTPヘッダー**: リクエストに関する追加情報（例: クライアントの情報、認証情報）。
- **HTTPボディ**: リクエストに含めるデータ（POSTリクエストなどで使用）。

### HTTPにおけるレスポンスの構造

HTTPレスポンスは、主に以下の部分から構成されます。

- **ステータスライン**: リクエストの結果を示します（例: 200 OK, 404 Not Found）。
- **HTTPヘッダー**: レスポンスに関する追加情報（例: コンテンツの種類、長さ）。
- **HTTPボディ**: リクエストに対する実際のデータ（HTML、JSON、画像など）。

## Rubyを使ったHTTP通信

### Net::HTTPライブラリ

Rubyには、HTTP通信を行うための標準ライブラリであるNet::HTTPが標準で用意されています。このライブラリを使用することで、HTTPリクエストの送信とHTTPレスポンスの受信を簡単に実装できます。

#### 1. chapter10 ディレクトリを作成してください。

```bash
mkdir chapter10
```

#### 2. chapter10/http.rb ファイルを作成し、次のコードを記述してください。

```ruby
require 'net/http'
require 'uri'

uri = URI.parse("http://www.example.com")
response = Net::HTTP.get_response(uri)

puts response.code
puts response.body
```

#### 3. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter10/http.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter10/http.rb
200
<!doctype html>
<html>
<head>
    <title>Example Domain</title>

    <meta charset="utf-8" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style type="text/css">
    body {
        background-color: #f0f0f2;
        margin: 0;
        padding: 0;
        font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        
    }
    div {
        width: 600px;
        margin: 5em auto;
        padding: 2em;
        background-color: #fdfdff;
        border-radius: 0.5em;
        box-shadow: 2px 3px 7px 2px rgba(0,0,0,0.02);
    }
    a:link, a:visited {
        color: #38488f;
        text-decoration: none;
    }
    @media (max-width: 700px) {
        div {
            margin: 0 auto;
            width: auto;
        }
    }
    </style>    
</head>

<body>
<div>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents. You may use this
    domain in literature without prior coordination or asking for permission.</p>
    <p><a href="https://www.iana.org/domains/example">More information...</a></p>
</div>
</body>
</html>
```

### まとめ

RubyのNet::HTTPライブラリを使うことで、HTTP通信を簡単に行うことができます。

サンプルコードでは、http://www.example.comにGETリクエストを送信し、レスポンスのステータスコードとボディを表示しています。

ステータスコードは200で、ボディにはHTMLが含まれています。

リクエストとレスポンスの構造を理解し、Net::HTTPライブラリを使ってHTTP通信を行うことで、他のアプリケーションとデータをやり取りしてより高度なプログラムを作成することができます。

## エラーハンドリング

エラーハンドリングは、プログラムがエラーを検知し、適切に処理することを指します。エラーハンドリングを行うことで、プログラムの安定性や信頼性を高めることができます。

Rubyでは、例外処理を使ってエラーハンドリングを行います。例外処理は、プログラムの実行中に発生したエラーをキャッチし、適切な処理を行うための仕組みです。

### 例外処理の基本

#### 1. chapter10/exception.rb ファイルを作成し、次のコードを記述してください。

```ruby
begin
  1 / 0
rescue ZeroDivisionError => e
  puts "ZeroDivisionError: #{e.message}"
end
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter10/exception.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter10/exception.rb
ZeroDivisionError: divided by 0
```

### まとめ

Rubyの例外処理を使うことで、プログラムの安定性を高めることができます。

例外処理は、beginとrescueを使って記述します。beginブロック内で例外が発生する可能性のある処理を記述し、rescueブロックで例外が発生した場合の処理を記述します。

サンプルコードでは、`1 / 0`という計算でZeroDivisionErrorが発生する処理を例外処理でキャッチしています。
※1を0で割ることはできないため、ZeroDivisionErrorが発生します。

## JSONを使ったデータのやり取り

### JSONとは

JSON（ジェイソン）は、データ交換フォーマットの一つで、人間にも機械にも読みやすいテキスト形式です。

主にAPIなどのWebアプリケーションにおけるデータの送受信に使われます。JSONは、シンプルな構造と軽量であることから広く利用されています。

### JSONの構造

JSONは、キーと値のペアでデータを表現します。主な構造として、オブジェクト（複数のキーと値のペア）と配列（順序付けられた値のリスト）があります。以下に、基本的なJSONの例を示します。

**例**

```json
{
  "name": "John",
  "age": 30,
  "is_student": false,
  "courses": ["Math", "Science", "History"]
}
```

この例では、name、age、is_studentがキーであり、それぞれに対応する値が設定されています。また、coursesは配列で、複数の文字列を含んでいます。

### RubyでJSONを扱う

RubyからJSONを効率的に扱うためにはjsonライブラリを使用してJSON文字列をRubyで扱いやすい形式に変換する必要があります。

#### 1. chapter10/json.rb ファイルを作成し、次のコードを記述してください。

```ruby
require 'json'

json_string = '{"name": "John", "age": 30, "is_student": false, "courses": ["Math", "Science", "History"]}'
data = JSON.parse(json_string)

puts data["name"]
puts data["age"]
puts data["is_student"]
puts data["courses"]
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter10/json.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter10/json.rb
John
30
false
Math
Science
History
```

### まとめ

JSONは、そのままの形式で扱おうとすると文字列として認識されるため、扱いにくいです。

Rubyのjsonライブラリを使って、JSON文字列をRubyのハッシュや配列に変換することで、データを効率的に扱うことができます。

サンプルコードでは、JSON文字列をJSON.parseメソッドを使ってRubyのハッシュに変換し、ハッシュのキーを使ってデータを取得しています。

JSONは、Webアプリケーションのデータ交換に広く利用されているため、RubyでJSONを扱う方法を理解しておくと便利です。