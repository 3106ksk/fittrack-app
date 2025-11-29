# 5章 配列を操作する

## 配列の重複を取り除く

### uniqメソッドを使った重複の削除

#### 1. chapter5ディレクトリを作成してください。

```bash
mkdir chapter5
```

#### 2. chapter5/uniq_example.rbファイルを作成し、次のコードを記述してください。

```ruby
numbers = [1, 2, 2, 3, 4, 4, 5, 5, 5]
unique_numbers = numbers.uniq
p numbers
p unique_numbers
```

#### 3. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter5/uniq_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter5/uniq_example.rb
[1, 2, 2, 3, 4, 4, 5, 5, 5]
[1, 2, 3, 4, 5]
```

※コンテナを止めてしまった人は下記のコマンドでコンテナにアクセスしましょう。

```bash
docker compose run --rm app bash
```

### まとめ

uniqメソッドを使うと、配列の要素から重複を取り除いた新しい配列を作成することができます。

その際、元の配列は変更されません。

サンプルコードでは、numbersから重複を取り除いたunique_numbersを作成しています。

重複している2, 4, 5が取り除かれて、要素の重複がない配列が作成されています。

### uniqメソッドを使わずに重複を取り除く

Rubyが用意している重複を取り除くための便利なメソッドを使わずに自分で重複を取り除くロジックを作ってみましょう。

#### 1. chapter5/uniq_example.rbファイルを以下の内容に編集してください。

```ruby
numbers = [1, 2, 2, 3, 4, 4, 5, 5, 5]
unique_numbers = []
numbers.each do |number|
  if !unique_numbers.include?(number)
    unique_numbers << number
  end
end
p numbers
p unique_numbers
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter5/uniq_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter5/uniq_example.rb
[1, 2, 2, 3, 4, 4, 5, 5, 5]
[1, 2, 3, 4, 5]
```

### まとめ

サンプルコードでは、uniqメソッドを使わずに重複を取り除くためにまず、numbersの要素を一つずつ取り出し、unique_numbersに取り出した要素が含まれていないかを確認しています。

unique_numbersにnumberの値が含まれていない場合のみ、<<メソッドを使用してunique_numbersにnumberを追加しています。

このようにすることで、重複を取り除いた新しい配列を作成することができます。

## 配列の要素を並び替える

### sortメソッドを使った並び替え

#### 1. chapter5/sort_example.rbファイルを作成し、次のコードを記述してください。

```ruby
numbers = [5, 3, 8, 1, 2, 7, 4, 6]
sorted_numbers = numbers.sort
p numbers
p sorted_numbers
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter5/sort_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter5/sort_example.rb
[5, 3, 8, 1, 2, 7, 4, 6]
[1, 2, 3, 4, 5, 6, 7, 8]
```

### まとめ

sortメソッドを使うと、配列の要素を昇順に並び替えることができます。

元の配列は変更されず、新しい配列が作成されます。

サンプルコードでは、numbersの要素を昇順に並び替えたsorted_numbersを作成しています。

降順に並び替えたい場合は、sortメソッドで並べ替えた配列をreverseメソッドで逆順にすることで実現できます。

**例**

```ruby
numbers = [5, 3, 8, 1, 2, 7, 4, 6]
sorted_numbers = numbers.sort.reverse
p sorted_numbers # => [8, 7, 6, 5, 4, 3, 2, 1]
```

### sortメソッドを使わずに並び替える

sortメソッドを使わずに自分で並び替えるロジックを作ってみましょう。

#### 1. chapter5/sort_example.rbファイルを以下の内容に編集してください。

```ruby
numbers = [5, 3, 8, 1, 2, 7, 4, 6]
numbers.size.times do
  (numbers.size - 1).times do |j|
    if numbers[j] > numbers[j + 1]
      tmp_number = numbers[j]
      numbers[j] = numbers[j + 1]
      numbers[j + 1] = tmp_number
    end
  end
end
p numbers
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter5/sort_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter5/sort_example.rb
[1, 2, 3, 4, 5, 6, 7, 8]
```

### まとめ

サンプルコードでは、バブルソートというアルゴリズムを使ってnumbersの要素を昇順に並び替えています。

少し複雑な処理のため今完全に理解する必要はありません。

sortメソッドを使用すると下記で説明する処理を簡単に行うことができて便利であることがわかれば十分です。

サンプルコードは外側の繰り返し処理と内側の繰り返し処理の2つの繰り返し処理を行っています。

`numbers.size.times`でnumbersの要素数である8回繰り返し処理を行います。

その中で、`(numbers.size - 1).times`でnumbersの要素数から1を引いた数の7回繰り返し処理を行います。

つまり8回×7回で合計56回繰り返し処理を行います。

ここから内側の繰り返し処理の処理内容を見ていきましょう。

まず`(numbers.size - 1).times do |j|`でjに0が代入されます。

`if numbers[j] > numbers[j + 1]`ではindexが0の要素の5とindexが1の要素の3を比較しています。

5が3より大きいので、`numbers[j] = numbers[j + 1]`でindexが0の要素にindexが1の要素の値を代入しています。

次に`numbers[j + 1] = tmp_number`でindexが1の要素にtmp_numberの値を代入しています。

tmp_numberに`numbers[j]`の値を代入しているのは、要素代入を行う際に`numbers[j]`の値が変わってしまうためです。

この処理を行うことで、隣り合わせの要素の入れ替えを行っています。

この時点でnumbersは`[3, 5, 8, 1, 2, 7, 4, 6]`となります。

次の繰り返し処理ではjに1が代入されます。

`if numbers[j] > numbers[j + 1]`ではindexが1の要素の5とindexが2の要素の8を比較しています。

5が8より小さいので、要素の入れ替えは行われません。

次にjに2が代入され、indexが2の要素の8とindexが3の要素の1を比較しています。

8が1より大きいので、要素の入れ替えを行います。

入れ替えを行った後のnumbersは`[3, 5, 1, 8, 2, 7, 4, 6]`となります。

次にjに3が代入され、indexが3の要素の8とindexが4の要素の2を比較しています。

8が2より大きいので、要素の入れ替えを行います。

要素は`[3, 5, 1, 2, 8, 7, 4, 6]`となります。

次にjに4が代入され、indexが4の要素の8とindexが5の要素の7を比較しています。

8が7より大きいので、要素の入れ替えを行います。

要素は`[3, 5, 1, 2, 7, 8, 4, 6]`となります。

次にjに5が代入され、indexが5の要素の8とindexが6の要素の4を比較しています。

8が4より大きいので、要素の入れ替えを行います。

要素は`[3, 5, 1, 2, 7, 4, 8, 6]`となります。

次にjに6が代入され、indexが6の要素の8とindexが7の要素の6を比較しています。

8が6より大きいので、要素の入れ替えを行います。

要素は`[3, 5, 1, 2, 7, 4, 6, 8]`となります。

7回繰り返しを行ったので`numbers.size.times do`の2回目の繰り返し処理が開始します。

jには0が代入され、indexが0の要素の3とindexが1の要素の5を比較しています。

3が5より小さいので、要素の入れ替えは行われません。

次にjに1が代入され、indexが1の要素の5とindexが2の要素の1を比較しています。

5が1より大きいので、要素の入れ替えを行います。

要素は`[3, 1, 5, 2, 7, 4, 6, 8]`となります。

以下同様に繰り返し処理を行い、要素の入れ替えを行っていきます。

このように8回×7回で合計56回比較処理を行うことで、最終的に要素が昇順に並び替えられ、`[1, 2, 3, 4, 5, 6, 7, 8]`となります。

## 要素を変換する

### mapメソッドを使った要素の変換

#### 1. chapter5/map_example.rbファイルを作成し、次のコードを記述してください。

```ruby
numbers = [1, 2, 3, 4, 5]
doubled_numbers = numbers.map { |n| n * 2 }
p numbers
p doubled_numbers
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter5/map_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter5/map_example.rb
[1, 2, 3, 4, 5]
[2, 4, 6, 8, 10]
```

### まとめ

mapメソッドを使うと、配列の要素を変換した新しい配列を作成することができます。

サンプルコードでは、numbersの要素をひとつずつ取り出し、それぞれに2を掛けた新しい配列doubled_numbersを作成しています。

mapメソッドはサンプルコードのようにProcオブジェクト(`{}`)を引数に取ることができますが、ブロック(`do ~ end`)を使っても同じように使うことができます。

**例**

```ruby
numbers = [1, 2, 3, 4, 5]
doubled_numbers = numbers.map do |n|
  n * 2
end
p numbers
p doubled_numbers
```

## 要素を選別する

### filterメソッドを使った要素の選別

#### 1. chapter5/filter_example.rbファイルを作成し、次のコードを記述してください。

```ruby
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
even_numbers = numbers.filter { |n| n.even? }
p numbers
p even_numbers
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter5/filter_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter5/filter_example.rb
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
[2, 4, 6, 8, 10]
```

### まとめ

filterメソッドを使うと、配列の要素の中から条件に合致するものだけを選別することができます。

サンプルコードでは、numbersの要素をひとつずつ取り出し、それぞれeven?メソッドを使用して偶数かどうかを判定して、偶数の要素だけを選別した新しい配列even_numbersを作成しています。

filterメソッドと同じ働きをするメソッドにselectメソッドがあります。どちらも同じ結果を返します。

**例**

```ruby
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
even_numbers = numbers.select { |n| n.even? }
p numbers # => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
p even_numbers # => [2, 4, 6, 8, 10]
```

### 新しい配列を作成するメソッド

| メソッド | 説明 | 例 | 結果 |
|---------|------|-----|------|
| map | 配列の要素を変換する | [1, 2, 3, 4, 5].map { \|n\| n * 2 } | [2, 4, 6, 8, 10] |
| collect | 配列の要素を変換する | [1, 2, 3, 4, 5].collect { \|n\| n * 2 } | [2, 4, 6, 8, 10] |
| filter | 条件に合致する要素のみの配列を作成する | [1, 2, 3, 4, 5].filter { \|n\| n.even? } | [2, 4] |
| select | 条件に合致する要素のみの配列を作成する | [1, 2, 3, 4, 5].select { \|n\| n.even? } | [2, 4] |
| reject | 条件に合致しない要素のみの配列を作成する | [1, 2, 3, 4, 5].reject { \|n\| n.even? } | [1, 3, 5] |

## 配列を結合する

### joinメソッドを使った配列の結合

#### 1. chapter5/join_example.rbファイルを作成し、次のコードを記述してください。

```ruby
words = ["Hello", "world", "this", "is", "Ruby"]
joined_string = words.join(" ")
p words
p joined_string
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter5/join_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter5/join_example.rb
["Hello", "world", "this", "is", "Ruby"]
"Hello world this is Ruby"
```

### まとめ

joinメソッドを使うと、配列の要素を指定した区切り文字で結合することができます。

サンプルコードでは、wordsの要素を空白で結合した新しい文字列joined_stringを作成しています。

## 配列の要素数を取得する

### size・lengthメソッドを使った要素数の取得

#### 1. chapter5/size_length_example.rbファイルを作成し、次のコードを記述してください。

```ruby
numbers = [1, 2, 3, 4, 5]
puts numbers.size
puts numbers.length
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter5/size_length_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter5/size_length_example.rb
5
5
```

### まとめ

配列の要素数を取得するには、sizeメソッドかlengthメソッドを使います。