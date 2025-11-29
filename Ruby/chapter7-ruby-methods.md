# 7章 メソッドについて

## メソッドの基本

### メソッドとは何か

メソッドは、プログラムの特定の機能を実行するためのコードの塊です。

メソッドは、defキーワードを使って定義し、メソッド名を指定します。メソッドの中には、処理内容が記述されます。

#### 1. chapter7ディレクトリを作成してください。

```bash
mkdir chapter7
```

#### 2. chapter7/method_concept.rbファイルを作成し、次のコードを記述してください。

```ruby
def say_hello
  puts "Hello, Ruby!"
end
  
say_hello
```

#### 3. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter7/method_concept.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter7/method_concept.rb
Hello, Ruby!
```

※コンテナを止めてしまった人は下記のコマンドでコンテナにアクセスしましょう。

```bash
docker compose run --rm app bash
```

### まとめ

サンプルコードでは、defを使ってsay_helloというメソッドを定義しています。

その後say_helloと書いてありますが、これはメソッドを呼び出しています。

メソッドは定義しただけでは実行されないため、実行するにはメソッドを呼び出す必要があります。

### メソッドを使って同じような処理を実行しやすくする

#### 1. chapter7/method_importance.rbファイルを作成し、次のコードを記述してください。

```ruby
puts "Hello, Alice!"
puts "Hello, Bob!"
puts "Hello, Carol!"

def greet(name)
  puts "Hello, #{name}!"
end

greet("Alice")
greet("Bob")
greet("Carol")
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter7/method_importance.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter7/method_importance.rb
Hello, Alice!
Hello, Bob!
Hello, Carol!
Hello, Alice!
Hello, Bob!
Hello, Carol!
```

### まとめ

メソッドを使うことで、同じ処理を繰り返し記述する手間を省くことができます。

これにより、コードの重複を避け、プログラム全体の可読性とメンテナンス性が向上します

サンプルコードでは、greetというメソッドを定義し、その中でputsを使ってメッセージを出力しています。

メソッドの引数にnameを指定することでどんな名前でもシンプルなメソッドを使用するだけで挨拶を出力できます。

## メソッドの引数

### 基本的な引数

引数（ひきすう）は、メソッドに渡される値のことです。

メソッドは、引数を使って動的に処理を行うことができます。

引数はメソッド名の後に括弧で囲んで指定し、メソッドを呼び出す際に値を渡します。

#### 1. chapter7/method_arguments.rbファイルを作成し、次のコードを記述してください。

```ruby
def greet(name)
  puts "Hello, #{name}!"
end

greet("Alice")
greet "Bob"
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter7/method_arguments.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter7/method_arguments.rb
Hello, Alice!
Hello, Bob!
```

### まとめ

基本的な引数を使うことで、メソッドに値を渡して動的な処理を行うことができます。

引数はメソッド名の後に括弧で囲んで指定し、メソッドを呼び出す際に値を渡します。

また、シンプルな引数の場合は、括弧を省略して半角スペース区切りでメソッド名と引数を記述して呼び出すこともできます。

### デフォルト引数

デフォルト引数を使用すると、引数が渡されなかった場合に使用されるデフォルトの値を指定できます。

#### 1. chapter7/default_arguments.rbファイルを作成し、次のコードを記述してください。

```ruby
def greet(name = "Guest")
  puts "Hello, #{name}!"
end

greet("Alice")
greet
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter7/default_arguments.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter7/default_arguments.rb
Hello, Alice!
Hello, Guest!
```

### まとめ

デフォルト引数を使うことで、引数が渡されなかった場合に使用されるデフォルトの値を指定できます。

サンプルコードでは、greetメソッドの引数に`name = "Guest"`とデフォルト値を指定しています。

そのため、greetメソッドを呼び出す際に引数を指定しない場合は、デフォルト値のGuestが使用されます。

### 可変長引数

可変長引数（かへんちょうひきすう）を使用すると、任意の数の引数をメソッドに渡すことができます。

可変長引数はアスタリスク（`*`）を使って定義し、渡された引数は配列として扱われます。

#### 1. chapter7/variable_arguments.rbファイルを作成し、次のコードを記述してください。

```ruby
def greet(*names)
  names.each do |name|
    puts "Hello, #{name}!"
  end
end

greet("Alice", "Bob", "Carol")
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter7/variable_arguments.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter7/variable_arguments.rb
Hello, Alice!
Hello, Bob!
Hello, Carol!
```

### まとめ

可変長引数を使うことで、任意の数の引数をメソッドに渡すことができます。

可変長引数はアスタリスク（`*`）を使って定義し、渡された引数は配列として扱われます。

サンプルコードでは、greetメソッドの引数に`*names`と可変長引数を指定しています。

そのため、eachメソッドを使って引数の配列を繰り返し処理し、複数の名前を使った挨拶を出力しています。

### キーワード引数

キーワード引数を使用すると、引数の順番を気にせずにメソッドに値を渡すことができます。

キーワード引数は、引数名と値をセットで指定し、メソッドを呼び出す際に引数名を指定して値を渡します。

#### 1. chapter7/keyword_arguments.rbファイルを作成し、次のコードを記述してください。

```ruby
def greet(name:, age:)
  puts "Hello, I am #{name}!"
  puts "I am #{age} years old."
end

greet(age: 20, name: "Alice")
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter7/keyword_arguments.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter7/keyword_arguments.rb
Hello, I am Alice!
I am 20 years old.
```

### まとめ

キーワード引数を使うことで、引数の順番を気にせずにメソッドに値を渡すことができます。

サンプルコードでは、greetメソッドの引数に`name:`, `age:`とキーワード引数を指定しています。

そのため、メソッドを呼び出す際に引数を渡す順番を気にせずに、引数名を指定して値を渡すことができます。

## メソッドと変数のスコープ

### メソッド内での変数のスコープ

メソッド内で定義されたローカル変数は、そのメソッド内からのみ参照することが出来ます。

※変数は変数名の最初の一文字によって、ローカル変数、インスタンス変数、クラス変数、グローバル変数などの区別がされます。変数名の最初の文字が小文字かアンダーバーから始まる変数はローカル変数と呼ばれます。

#### 1. chapter7/scope.rbファイルを作成し、次のコードを記述してください。

```ruby
def greet
  message = "Hello, Ruby!"
  puts message
end

greet
puts message
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter7/scope.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter7/scope.rb
Hello, Ruby!
chapter7/scope.rb:6:in `<main>': undefined local variable or method `message' for main:Object (NameError)
```

### まとめ

メソッド内で定義されたローカル変数は、そのメソッド内でのみ有効です。

サンプルコードでは、greetメソッド内でローカル変数messageを定義しています。

メソッド内で定義したローカル変数はメソッド内からのみ参照できるため、メソッド外から`puts message`のような形で参照しようとするとエラーが発生します