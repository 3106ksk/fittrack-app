# 4章 配列の基本

## 配列の基本

### 配列とは

配列（Array）は、複数の値を一つの変数にまとめて管理するためのデータ構造です。Rubyでは、配列は`[]`（角括弧）を使用して定義します。例えば、次のようにして整数の配列を作成できます。

**例**

```ruby
numbers = [1, 2, 3, 4, 5]
```

この配列numbersには、5つの整数が順番に格納されています。Rubyの配列は、異なるデータ型の要素を混在させることも可能です。

**例**

```ruby
mixed_array = [1, "two", 3.0, [4, 5], {six: 6}]
```

このように、数値、文字列、浮動小数点数、別の配列、ハッシュなど様々なオブジェクトを一つの配列にまとめることができます。

### 配列の作り方

#### 1. chapter4 ディレクトリを作成してください。

```bash
mkdir chapter4
```

#### 2. chapter4/generate_array.rb ファイルを作成し、次のコードを記述してください。

```ruby
fruits = ["apple", "banana", "cherry"]
p fruits
```

#### 3. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/generate_array.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/generate_array.rb
["apple", "banana", "cherry"]
```

※コンテナを止めてしまった人は下記のコマンドでコンテナにアクセスしましょう。

```bash
docker compose run --rm app bash
```

※上記のサンプルコードではputsメソッドではなく、pメソッドを使って配列を出力しています。pメソッドは、配列やハッシュなどのオブジェクトをそのまま出力するため、要素の形式が見やすくなります。
気になる方は、putsメソッドを使って出力がどう変わるか確認してみてください。

## 配列のindexとアクセス方法

### インデックス（Index）とは？

インデックス（Index）とは、配列内の要素の位置を示す数値のことです。Rubyでは、インデックスは0から始まります。つまり、最初の要素はインデックス0、次の要素はインデックス1となります。

### 配列の要素にアクセスする

#### 1. chapter4/array_index.rb ファイルを作成し、次のコードを記述してください。

```ruby
fruits = ["apple", "banana", "cherry", "date", "elderberry"]
puts fruits[0]
puts fruits[1]
puts fruits[2]
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_index.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_index.rb
apple
banana
cherry
```

### まとめ

配列の要素にアクセスするには、配列名の後に`[]`（角括弧）を使ってインデックスを指定します。

サンプルコードでは、配列fruitsのインデックス0、1、2の要素を取り出しています。
インデックスは0から始まるため、fruits[0]では配列の一番最初の要素であるappleを取り出すことができます。

**例**

```ruby
fruits = ["apple", "banana", "cherry", "date", "elderberry"]
puts fruits[0] # apple
puts fruits[1] # banana
puts fruits[2] # cherry
```

### 負のインデックス

Rubyでは、負のインデックスを使って配列の最後から要素にアクセスすることもできます。

#### 1. chapter4/array_index.rb ファイルを以下の内容に編集して負のインデックスを使った要素のアクセスを追加してください。

```ruby
fruits = ["apple", "banana", "cherry", "date", "elderberry"]
puts fruits[-1]
puts fruits[-2]
puts fruits[-3]
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_index.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_index.rb
elderberry
date
cherry
```

### まとめ

負のインデックスを使うと、配列の最後から要素にアクセスすることができます。

サンプルコードでは、配列fruitsの負のインデックス-1、-2、-3の要素を取り出しています。

インデックスの-1は、配列の最後の要素を示すので、fruits[-1]では配列の一番最後の要素であるelderberryを取り出すことができます。

**例**

```ruby
fruits = ["apple", "banana", "cherry", "date", "elderberry"]
puts fruits[-1] # elderberry
puts fruits[-2] # date
puts fruits[-3] # cherry
```

### 範囲を使ったアクセス

範囲（Range）を使って、配列の一部の要素を取り出すこともできます。

#### 1. chapter4/array_index.rb ファイルを以下の内容に編集して範囲を使った要素のアクセスを追加してください。

```ruby
fruits = ["apple", "banana", "cherry", "date", "elderberry"]
p fruits[1..3]
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_index.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_index.rb
["banana", "cherry", "date"]
```

### まとめ

範囲を使うと、配列の一部の要素を取り出すことができます。

サンプルコードでは、配列fruitsのインデックス1から3までの要素を取り出しています。

`1..3`は、インデックス1から3までの範囲を示しています。

インデックス1は最初から2番目の要素のことなので、fruits[1..3]では、banana、cherry、dateの3つの要素が取り出されます。

**例**

```ruby
fruits = ["apple", "banana", "cherry", "date", "elderberry"]
p fruits[1..3] # ["banana", "cherry", "date"]
```

## 配列に要素を追加する

### pushメソッドを使って要素を追加する

#### 1. chapter4/array_push.rb ファイルを作成し、次のコードを記述してください。

```ruby
fruits = ["apple", "banana"]
p fruits
fruits.push("cherry")
p fruits
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_push.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_push.rb 
["apple", "banana"]
["apple", "banana", "cherry"]
```

### まとめ

pushメソッドを使うと、配列の末尾に要素を追加することができます。

サンプルコードでは、配列fruitsの末尾に要素cherryを追加しています。

cherryを配列の末尾に追加するので、追加後の配列は`["apple", "banana", "cherry"]`となります。

**例**

```ruby
fruits = ["apple", "banana"]
p fruits # ["apple", "banana"]
fruits.push("cherry")
p fruits # ["apple", "banana", "cherry"]
```

### <<メソッドを使って要素を追加する

`<<`メソッドを使うことでも、pushと同様に配列の末尾に要素を追加することができます。

#### 1. chapter4/array_push.rb ファイルを以下の内容に編集してください。

```ruby
fruits = ["apple", "banana"]
p fruits
fruits << "cherry"
p fruits
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_push.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_push.rb 
["apple", "banana"]
["apple", "banana", "cherry"]
```

### まとめ

pushメソッドの時と同様に配列の末尾に追加するので、追加後の配列は`["apple", "banana", "cherry"]`となります。

**例**

```ruby
fruits = ["apple", "banana"]
p fruits # ["apple", "banana"]
fruits << "cherry"
p fruits # ["apple", "banana", "cherry"]
```

### unshiftメソッドを使って要素を追加する

#### 1. chapter4/array_push.rb ファイルを以下の内容に編集してください。

```ruby
fruits = ["apple", "banana"]
p fruits
fruits.unshift("cherry")
p fruits
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_push.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_push.rb 
["apple", "banana"]
["cherry", "apple", "banana"]
```

### まとめ

unshiftメソッドを使うと、配列の先頭に要素を追加することができます。

サンプルコードでは、配列fruitsの先頭に要素cherryを追加しています。

cherryを配列の先頭に追加するので、追加後の配列は`["cherry", "apple", "banana"]`となります。

**例**

```ruby
fruits = ["apple", "banana"]
p fruits # ["apple", "banana"]
fruits.unshift("cherry")
p fruits # ["cherry", "apple", "banana"]
```

### insertメソッドを使って要素を追加する

#### 1. chapter4/array_push.rb ファイルを以下の内容に編集してください。

```ruby
fruits = ["apple", "banana"]
p fruits
fruits.insert(1, "cherry")
p fruits
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_push.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_push.rb 
["apple", "banana"]
["apple", "cherry", "banana"]
```

### まとめ

insertメソッドを使うと、指定したインデックスに要素を追加することができます。

サンプルコードでは、配列fruitsのインデックス1に要素cherryを追加しています。

cherryを配列のインデックス1に追加するので、追加後の配列は`["apple", "cherry", "banana"]`となります。

**例**

```ruby
fruits = ["apple", "banana"]
p fruits # ["apple", "banana"]
fruits.insert(1, "cherry")
p fruits # ["apple", "cherry", "banana"]
```

### 配列に要素を追加する方法まとめ

| メソッド | 説明 | 例 |
|---------|------|-----|
| push | 配列の末尾に要素を追加する | fruits.push("cherry") |
| << | 配列の末尾に要素を追加する | fruits << "cherry" |
| unshift | 配列の先頭に要素を追加する | fruits.unshift("cherry") |
| insert | 指定したインデックスに要素を追加する | fruits.insert(1, "cherry") |

## 配列から要素を削除する

### popメソッドを使って要素を削除する

#### 1. chapter4/array_pop.rb ファイルを作成し、次のコードを記述してください。

```ruby
fruits = ["apple", "banana", "avocado"]
p fruits
fruits.pop
p fruits
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_pop.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_pop.rb 
["apple", "banana", "avocado"]
["apple", "banana"]
```

### まとめ

popメソッドを使うと、配列の末尾の要素を削除することができます。

サンプルコードでは、配列fruitsの末尾の要素avocadoを削除しています。

avocadoを配列の末尾から削除するので、削除後の配列は`["apple", "banana"]`となります。

**例**

```ruby
fruits = ["apple", "banana", "avocado"]
p fruits # ["apple", "banana", "avocado"]
fruits.pop
p fruits # ["apple", "banana"]
```

### shiftメソッドを使って要素を削除する

#### 1. chapter4/array_pop.rb ファイルを以下の内容に編集してください。

```ruby
fruits = ["apple", "banana", "avocado"]
p fruits
fruits.shift
p fruits
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_pop.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_pop.rb 
["apple", "banana", "avocado"]
["banana", "avocado"]
```

### まとめ

shiftメソッドを使うと、配列の先頭の要素を削除することができます。

サンプルコードでは、配列fruitsの先頭の要素appleを削除しています。

appleを配列の先頭から削除するので、削除後の配列は`["banana", "avocado"]`となります。

**例**

```ruby
fruits = ["apple", "banana", "avocado"]
p fruits # ["apple", "banana", "avocado"]
fruits.shift
p fruits # ["banana", "avocado"]
```

### deleteメソッドを使って要素を削除する

#### 1. chapter4/array_pop.rb ファイルを以下の内容に編集してください。

```ruby
fruits = ["apple", "banana", "cherry"]
p fruits
fruits.delete("banana")
p fruits
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_pop.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_pop.rb 
["apple", "banana", "cherry"]
["apple", "cherry"]
```

#### 3. chapter4/array_pop.rb ファイルを以下の内容に編集してください。

```ruby
fruits = ["apple", "banana", "cherry", "banana"]
p fruits
fruits.delete("banana")
p fruits
```

#### 4. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_pop.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_pop.rb 
["apple", "banana", "cherry", "banana"]
["apple", "cherry"]
```

### まとめ

deleteメソッドを使うと、指定した要素を削除することができます。

削除対象が複数ある場合、全ての要素が削除されます。

サンプルコードでは、配列fruitsから要素bananaをすべて削除しています。

**例**

```ruby
fruits = ["apple", "banana", "cherry", "banana"]
p fruits # ["apple", "banana", "cherry", "banana"]
fruits.delete("banana")
p fruits # ["apple", "cherry"]
```

### delete_atメソッドを使って要素を削除する

#### 1. chapter4/array_pop.rb ファイルを以下の内容に編集してください。

```ruby
fruits = ["apple", "banana", "cherry"]
fruits.delete_at(1)
p fruits
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_pop.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_pop.rb 
["apple", "cherry"]
```

### まとめ

delete_atメソッドを使うと、指定したインデックスの要素を削除することができます。

サンプルコードでは、配列fruitsのインデックス1の要素bananaを削除しています。

**例**

```ruby
fruits = ["apple", "banana", "cherry"]
fruits.delete_at(1)
p fruits # ["apple", "cherry"]
```

### 配列から要素を削除する方法まとめ

| メソッド | 説明 | 例 |
|---------|------|-----|
| pop | 配列の末尾の要素を削除する | fruits.pop |
| shift | 配列の先頭の要素を削除する | fruits.shift |
| delete | 指定した要素を削除する | fruits.delete("banana") |
| delete_at | 指定したインデックスの要素を削除する | fruits.delete_at(1) |

## 配列を使った繰り返し処理

### eachメソッド

eachメソッドは、配列の各要素に対して繰り返し処理を行うためのメソッドです。eachメソッドはブロックを受け取り、配列の全ての要素を順番にそのブロックに渡します。ブロック内で実行される処理は、配列の各要素に対して行われます。

**補足:** ブロックとは、メソッドの引数として渡すことができる処理のまとまりです。ブロックは`do ~ end`または`{ ~ }`で囲みます。

### eachメソッドの使い方

#### 1. chapter4/array_each.rb ファイルを作成し、次のコードを記述してください。

```ruby
fruits = ["apple", "banana", "cherry"]

fruits.each do |fruit|
  puts fruit
end
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_each.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_each.rb 
apple
banana
cherry
```

### まとめ

eachメソッドを使うと、配列の各要素に対して繰り返し処理を行うことができます。

サンプルコードでは、配列fruitsの各要素を順番に出力しています。

**例**

```ruby
fruits = ["apple", "banana", "cherry"]

fruits.each do |fruit|
  puts fruit
end
```

- 1回目: fruitsから一番目の要素のappleを取り出してfruitに値を入れて表示する
- 2回目: fruitsから二番目の要素のbananaを取り出してfruitに値を入れて表示する
- 3回目: fruitsから三番目の要素のcherryを取り出してfruitに値を入れて表示する

### インデックスを使ったeachメソッド

#### 1. chapter4/array_each.rb ファイルを以下の内容に編集してください。

```ruby
fruits = ["apple", "banana", "cherry"]

fruits.each_with_index do |fruit, index|
  puts "#{index}: #{fruit}"
end
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_each.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_each.rb 
0: apple
1: banana
2: cherry
```

### まとめ

each_with_indexメソッドを使うと、何回目の繰り返しかを示すインデックスを取得できます。

doの後に`|fruit, index|`と記述してありますが、これはどんな名前でも構いません。`|f, i|`のように短くしても動作します。しかし変数名から意味がわかるようにするため、わかりやすい名前を使うと良いでしょう。

## 配列の要素を変更する

### indexを使って要素を変更する

#### 1. chapter4/array_change.rb ファイルを作成し、次のコードを記述してください。

```ruby
fruits = ["apple", "banana", "cherry"]
p fruits
fruits[1] = "avocado"
p fruits
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter4/array_change.rb
```

**実行結果**

```
root@9fdd7ebb05a1:/app# ruby chapter4/array_change.rb 
["apple", "banana", "cherry"]
["apple", "avocado", "cherry"]
```

### まとめ

インデックスを指定して値を代入することで要素を変更することができます。

サンプルコードでは、配列fruitsのインデックス1の要素bananaをavocadoに変更しています。

**例**

```ruby
fruits = ["apple", "banana", "cherry"]
p fruits # ["apple", "banana", "cherry"]
fruits[1] = "avocado"
p fruits # ["apple", "avocado", "cherry"]
```

## まとめ

配列を使った繰り返し処理や要素の変更方法を学びました。

たくさんメソッドが出てきましたが暗記しようとする必要はありません。

どんなことが出来るのかを知っておけば、必要な時に調べて使うことができます。