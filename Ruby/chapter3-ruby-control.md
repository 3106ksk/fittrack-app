# 3章 プログラムを制御する

## if文を使った条件分岐

### if文とは

if文は、条件によって処理を分岐させるための制御構文です。

Aの場合はBをする、そうでない場合はCをする、といった処理を実装する際に使用します。

### 基本的なif文の使い方

#### 1. chapter3/basic_conditional.rbファイルを作成してください。

#### 2. 以下のコードをchapter3/basic_conditional.rbに記述してください。

```ruby
number = 10

if number > 5
  puts "この数値は5より大きいです"
end
```

#### 3. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter3/basic_conditional.rb
```

**実行結果**

```
root@54e2bcabe140:/app# ruby chapter3/basic_conditional.rb
この数値は5より大きいです
```

※コンテナを止めてしまった人は下記のコマンドでコンテナにアクセスしましょう。

```bash
docker compose run --rm app bash
```

#### 4. chapter3/basic_conditional.rbファイルを以下の内容に変更してください。

```ruby
number = 3

if number > 5
  puts "この数値は5より大きいです"
else
  puts "この数値は5以下です"
end
```

#### 5. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter3/basic_conditional.rb
```

**実行結果**

```
root@54e2bcabe140:/app# ruby chapter3/basic_conditional.rb
この数値は5以下です
```

#### 6. chapter3/basic_conditional.rbファイルを以下の内容に変更してください。

```ruby
number = 5

if number > 5
  puts "この数値は5より大きいです"
elsif number == 5
  puts "この数値は5です"
else
  puts "この数値は5より小さいです"
end
```

#### 7. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter3/basic_conditional.rb
```

**実行結果**

```
root@54e2bcabe140:/app# ruby chapter3/basic_conditional.rb
この数値は5です
```

### まとめ

if文は、条件が真(true)の場合に中の処理を実行します。

**例**

```ruby
if true
  puts "この処理は実行されます"
end
```

条件が偽(false)の場合は、中の処理は実行されません。

**例**

```ruby
if false
  puts "この処理は実行されません"
end
```

サンプルコードは、変数numberが5より大きい場合に「この数値は5より大きいです」と表示する処理です。

**例**

```ruby
number = 10

if number > 5
  puts "この数値は5より大きいです"
end
```

numberの値が10なので、条件が真となり「この数値は5より大きいです」と表示されます。

else節を使うことで、条件が偽の場合に別の処理を実行することができます。

**例**

```ruby
if true
  puts "この処理は実行されます"
else
  puts "この処理は実行されません"
end
```

サンプルコードは、変数numberが5より大きくない場合「この数値は5以下です」と表示する処理です。

**例**

```ruby
number = 3

if number > 5
  puts "この数値は5より大きいです"
else
  puts "この数値は5以下です"
end
```

numberの値が3なので、number > 5条件が偽となりelse節の「この数値は5以下です」と表示されます。

elsif節を使うことで、複数の条件を指定することができます。

**例**

```ruby
if false
  puts "この処理は実行されません"
elsif true
  puts "この処理は実行されます"
else
  puts "この処理は実行されません"
end
```

サンプルコードは、変数numberが5より大きい場合「この数値は5より大きいです」、5の場合「この数値は5です」、5より小さい場合「この数値は5より小さいです」と表示する処理です。

**例**

```ruby
number = 5

if number > 5
  puts "この数値は5より大きいです"
elsif number == 5
  puts "この数値は5です"
else
  puts "この数値は5より小さいです"
end
```

numberの値が5なので、number == 5条件が真となり「この数値は5です」と表示されます。

## 比較演算子

### 比較演算子とは

比較演算子は、2つの値を比較して真偽値(trueかfalse)を返す演算子です。

大きい・小さい・等しい・等しくないなどの比較を行う際に使用します。

#### 1. chapter3/comparison_operators.rbファイルを作成し、次の内容を記述してください。

```ruby
a = 10
b = 20

puts a == b
puts a != b
puts a > b
puts a < b
puts a >= b
puts a <= b
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter3/comparison_operators.rb
```

**実行結果**

```
root@54e2bcabe140:/app# ruby chapter3/comparison_operators.rb
false
true
false
true
false
true
```

### まとめ

比較演算子は、2つの値を比較して真偽値を返します。

サンプルコードでは、変数aとbの値を比較しています。

変数にどんな値が入っているかがイメージできると理解しやすくなるので変数を直接数値に置き換えてどのような比較が行われているか確認してみましょう。

サンプルコードの変数aとbの値はそれぞれ10と20なので、以下のような比較が行われます。

**例**

```ruby
10 == 20 # => false
10 != 20 # => true
10 > 20 # => false
10 < 20 # => true
10 >= 20 # => false
10 <= 20 # => true
```

Rubyでは以下のような比較演算子が用意されています。

これ以外にも比較演算子は存在しますが、まずは基本的なものを紹介します。

| 演算子 | 説明 | 例 | 結果 |
|--------|------|-----|------|
| == | 等しい | 10 == 20 | false |
| != | 等しくない | 10 != 20 | true |
| > | より大きい | 10 > 20 | false |
| < | より小さい | 10 < 20 | true |
| >= | 以上 | 10 >= 20 | false |
| <= | 以下 | 10 <= 20 | true |

## 論理演算子

### 論理演算子とは

論理演算子は、真偽値を扱う際に使用される演算子です。

真偽値を組み合わせて新しい真偽値を返す際に使用します。

#### 1. chapter3/logical_operators.rbファイルを作成し次の内容を記述してください。

```ruby
a = true
b = false

puts a && b
puts a || b
puts !a
puts !b
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter3/logical_operators.rb
```

**実行結果**

```
root@54e2bcabe140:/app# ruby chapter3/logical_operators.rb
false
true
false
true
```

### まとめ

論理演算子は、真偽値を組み合わせて新しい真偽値を返します。

変数を直接数値に置き換えてどのようなことが行われているか確認してみましょう。

**例**

```ruby
true && false # => false
true || false # => true
!true # => false
!false # => true
```

`&&`は左辺と右辺が両方ともtrueの場合にtrueを返します。サンプルコードでは右辺がfalseなのでfalseを返します。

`||`は左辺と右辺のどちらかがtrueの場合にtrueを返します。サンプルコードでは左辺がtrueなのでtrueを返します。

`!`は真偽値を反転させます。trueの場合はfalseを、falseの場合はtrueを返します。

Rubyでは以下のような論理演算子が用意されています。

| 演算子 | 説明 | 例 | 結果 |
|--------|------|-----|------|
| && | かつ | true && false | false |
| \|\| | または | true \|\| false | true |
| ! | 否定 | !true | false |
| ! | 否定 | !false | true |

`&&`演算子は、左右の値が両方ともtrueの場合にtrueを返します。
また、捉え方として左辺がtrueの場合に右辺を返すと考えることもできます。

**例**

```ruby
a = true
b = false
c = 'RUNTEQ'

puts a && c # => RUNTEQ
puts b && c # => false
```

`||`演算子は、左右の値のどちらかがtrueの場合にtrueを返します。
また、捉え方として左辺がfalseの場合に右辺を返すと考えることもできます。

**例**

```ruby
a = true
b = false
c = 'RUNTEQ'

puts a || c # => true
puts b || c # => RUNTEQ
```

自分が理解しやすいと思う捉え方で論理演算子を理解してみましょう。

## case文を使った条件分岐

### case文とは

case文は、複数の条件を比較する際に使用される制御構文です。

if文と同様に条件によって処理を分岐させることができます。

#### 1. chapter3/case_basic.rbファイルを作成し次の内容を記述してください。

```ruby
language = 'Ruby'

case language
when 'Ruby'
  puts '私はRubyistです'
when 'Python'
  puts '私はPythonistaです'
when 'PHP'
  puts '私はPHPerです'
else
  puts '私はプログラマーです'
end
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter3/case_basic.rb
```

**実行結果**

```
root@54e2bcabe140:/app# ruby chapter3/case_basic.rb
私はRubyistです
```

### まとめ

case文は、複数の条件を比較する際に使用される制御構文です。

case文は、when節で条件を指定し、その条件に一致した場合に処理を実行します。

サンプルコードでは、変数languageの値によって処理を分岐させています。

**例**

```ruby
language = 'Ruby'

case language
when 'Ruby' # languageの値が'Ruby'の場合
  puts '私はRubyistです'
when 'Python' # languageの値が'Python'の場合
  puts '私はPythonistaです'
when 'PHP' # languageの値が'PHP'の場合
  puts '私はPHPerです'
else # どの条件にも一致しない場合
  puts '私はプログラマーです'
end
```

if文でもif elsif elseを使って同じような処理を実装することができますが、条件の数が多い場合はcase文を使った方が見やすいコードになることがあります。

## Rubyの繰り返し処理

### 繰り返し処理とは

繰り返し処理は、同じ処理を繰り返し実行することです。

例えば、1から始めて数値を1ずつ足して5までの数字を順番に表示する処理を考えてみましょう。

一回ごとに表示したい数字を計算して指定していくと下記のようになります。

- 1を表示
- 2を表示
- 3を表示
- 4を表示
- 5を表示

上記の処理を繰り返し処理を使って実装すると下記のようになります。

- 1から始めて数字が5になるまで繰り返し1ずつ数字を増やして表示する

繰り返し処理を行うことで一回一回自分で数字を計算して指定することがなくなりシンプルな命令で効率的に処理を行うことができます。

Rubyでは繰り返し処理を行うためにwhile文、timesメソッド、each文などが用意されています。

## while文を使った繰り返し処理

### while文の基本

#### 1. chapter3/while_loop.rbファイルを作成し次の内容を記述してください。

```ruby
i = 1

puts "繰り返し処理を開始します"
while i <= 5
  puts "#{i}回目"
  i += 1
end
puts "繰り返し処理を終了しました"
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter3/while_loop.rb
```

**実行結果**

```
root@54e2bcabe140:/app# ruby chapter3/while_loop.rb
繰り返し処理を開始します
1回目
2回目
3回目
4回目
5回目
繰り返し処理を終了しました
```

### まとめ

while文は、条件が真の間、指定した処理を繰り返し実行します。

サンプルコードでは、変数iが5以下の間、i回目と表示し、iに1を足す処理を繰り返しています。

**例**

```ruby
i = 1

while i <= 5
  puts "#{i}回目"
  i += 1
end
```

1. iが1の時、条件i <= 5が真なので`1回目`と表示してiを1増やします。
2. iが2の時、条件i <= 5が真なので`2回目`と表示してiを1増やします。
3. iが3の時、条件i <= 5が真なので`3回目`と表示してiを1増やします。
4. iが4の時、条件i <= 5が真なので`4回目`と表示してiを1増やします。
5. iが5の時、条件i <= 5が真なので`5回目`と表示してiを1増やします。
6. iが6の時、条件i <= 5が偽なので処理を終了します。

## timesメソッドを使った繰り返し処理

### timesメソッドの基本

#### 1. chapter3/times_method.rbファイルを作成し次の内容を記述してください。

```ruby
5.times do |i|
  puts "#{i + 1}回目"
end
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter3/times_method.rb
```

**実行結果**

```
root@54e2bcabe140:/app# ruby chapter3/times_method.rb
1回目
2回目
3回目
4回目
5回目
```

### まとめ

timesメソッドは、指定した回数だけ繰り返し処理を行うメソッドです。

サンプルコードでは、5回繰り返し処理を行い、(i + 1)回目と表示しています。

**例**

```ruby
5.times do |i|
  puts "#{i + 1}回目"
end
```

iには0から始まる数値が入るので、i + 1で1から始まる数値を表示しています。

1. iに0が入り、`0 + 1`で`1回目`と表示します。
2. iに1が入り、`1 + 1`で`2回目`と表示します。
3. iに2が入り、`2 + 1`で`3回目`と表示します。
4. iに3が入り、`3 + 1`で`4回目`と表示します。
5. iに4が入り、`4 + 1`で`5回目`と表示します。

## each文を使った繰り返し処理

### each文の基本

#### 1. chapter3/each_loop.rbファイルを作成し次の内容を記述してください。

```ruby
(1..5).each do |i|
  puts "#{i}回目"
end
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter3/each_loop.rb
```

**実行結果**

```
root@54e2bcabe140:/app# ruby chapter3/each_loop.rb
1回目
2回目
3回目
4回目
5回目
```

### まとめ

each文は、配列や範囲オブジェクトの要素を1つずつ取り出して繰り返し処理を行うメソッドです。

サンプルコードでは、1から5までの範囲オブジェクトを作成し、i回目と表示しています。

**例**

```ruby
(1..5).each do |i|
  puts "#{i}回目"
end
```

1. iに1が入り、`1回目`と表示します。
2. iに2が入り、`2回目`と表示します。
3. iに3が入り、`3回目`と表示します。
4. iに4が入り、`4回目`と表示します。
5. iに5が入り、`5回目`と表示します。