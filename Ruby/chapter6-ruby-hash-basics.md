# 6章 Hashの基本

## Hashの基本

### Hashとは

Hash(ハッシュ)は、キーと値のペアを格納するデータ構造です。キーと値は、コロン`:`または`=>`で区切られます。

キーと値のペアは、コンマ`,`で区切られます。

Hashは人の情報やメニューの情報など、関連するデータをまとめて格納するのに便利です。

Hashは中括弧`{}`を使用して定義します。

**例**

```ruby
{ name: "Alice", age: 30, city: "Wonderland" }

{ "name" => "Alice", "age" => 30, "city" => "Wonderland" }
```

#### 1. chapter6 ディレクトリを作成してください。

```bash
mkdir chapter6
```

#### 2. chapter6/basic_hash.rb ファイルを作成し、次のコードを記述してください。

```ruby
hash = { name: "Alice", age: 30, city: "Wonderland" }
puts hash
hash = { "name" => "Alice", "age" => 30, "city" => "Wonderland" }
puts hash
```

#### 3. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter6/basic_hash.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter6/basic_hash.rb
{:name=>"Alice", :age=>30, :city=>"Wonderland"}
{"name"=>"Alice", "age"=>30, "city"=>"Wonderland"}
```

※コンテナを止めてしまった人は下記のコマンドでコンテナにアクセスしましょう。

```bash
docker compose run --rm app bash
```

### まとめ

サンプルコードでは、nameというキーにAliceという値、ageというキーに30という値、cityというキーにWonderlandという値を持つHashを定義しています。

キーをシンボルで定義する場合は、コロン`:`を使用します。キーを文字列で定義する場合は、ダブルクォーテーション`""`を使用します。

どちらの方法でも、Hashの定義は有効ですが、値を取得する際には、キーを指定する方法が異なります。

## HashからValueを取得する方法

### キーを使用して値を取得する

#### 1. chapter6/get_value.rbファイルを作成し、次のコードを記述してください。

```ruby
hash_string = { "name" => "Alice", "age" => 30, "city" => "Wonderland" }
puts hash_string
puts hash_string["name"]
puts hash_string["age"]
puts hash_string["city"]

hash_symbol = { name: "Alice", age: 30, city: "Wonderland" }
puts hash_symbol
puts hash_symbol[:name]
puts hash_symbol[:age]
puts hash_symbol[:city]
```

#### 2. ファイルの保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter6/get_value.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter6/get_value.rb
{"name"=>"Alice", "age"=>30, "city"=>"Wonderland"}
Alice
30
Wonderland
{:name=>"Alice", :age=>30, :city=>"Wonderland"}
Alice
30
Wonderland
```

### まとめ

keyを指定して値を取得する場合、文字列でキーを指定する場合は、ダブルクォーテーション`""`を使用します。シンボルでキーを指定する場合は、コロン`:`を使用します。

サンプルコードではhash_stringは文字列でキーを指定して値を取得し、hash_symbolはsymbol(シンボル)という書き方でキーを指定して値を取得しています。

どちらの書き方でも問題ありませんが、シンボルを使用すると、メモリの使用量が少なくなるため、シンボルを使用することが推奨されています。

外部のサービスと連携する場合など、キーが文字列で返ってくる場合は、文字列でキーを指定して値を取得します。

## Hashを連結する方法

### 複数のHashを1つにまとめる

#### 1. chapter6/merge_hash.rbファイルを作成して、次のコードを記述してください。

```ruby
hash1 = { name: "Alice", age: 30 }
hash2 = { city: "Wonderland" }
hash3 = { name: "Bob", age: 20 }

merged_hash = hash1.merge(hash2)
puts merged_hash

merged_hash_with_conflict = hash1.merge(hash3)
puts merged_hash_with_conflict
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter6/merge_hash.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter6/merge_hash.rb
{:name=>"Alice", :age=>30, :city=>"Wonderland"}
{:name=>"Bob", :age=>20}
```

### まとめ

mergeメソッドを使用すると、複数のHashを1つにまとめることができます。

サンプルコードでは、hash1とhash2をmergeメソッドを使用して連結し、merged_hashに格納しています。

name, age, cityのキーがまとめられて1つのHashになります。

hash1とhash3は、nameとageのキーが重複しているため、mergeメソッドを使用すると、mergeメソッドの引数で指定したhash3の値のBob, 20が優先されます。

## Hashに対する繰り返し処理

### Hashの繰り返し処理

#### 1. chapter6/iterate_hash.rbファイルを作成し、次のコードを記述してください。

```ruby
hash = { name: "Alice", age: 30, city: "Wonderland" }

hash.each do |key, value|
  puts "#{key}: #{value}"
end
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter6/iterate_hash.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter6/iterate_hash.rb
name: Alice
age: 30
city: Wonderland
```

### まとめ

eachメソッドを使用すると、Hashのキーと値のペアを繰り返し処理することができます。

サンプルコードでは、hashのキーと値のペアを繰り返し処理して、キーと値を出力しています。

最初の繰り返し処理では、keyにname、valueにAliceが格納され、次の繰り返し処理では、keyにage、valueに30が格納され、最後の繰り返し処理では、keyにcity、valueにWonderlandが格納されます。

ここで使用しているkeyとvalueは、任意の変数名です。keyとvalue以外の変数名でも問題ありません。