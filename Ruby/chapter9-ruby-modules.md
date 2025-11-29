# 9章 モジュールについて

## モジュールの基本

### モジュールとは

Rubyのモジュールは、共通のメソッドや定数をまとめてグループ化する仕組みです。

クラスとは異なり、インスタンスを生成することはできませんが、他のクラスやモジュールに対して機能を追加することができます。

### モジュールの作り方

モジュールは、共通の機能をまとめて管理するための仕組みであり、クラスに機能を追加する際に便利です。

モジュールは、moduleキーワードを使って定義します。moduleキーワードの後にモジュール名を記述し、endで囲うことでモジュールを定義します。

**例**

```ruby
module Greeting
  def hello
    "Hello!"
  end
end
```

モジュールに定義したメソッドは、クラスにincludeキーワード、extendキーワードを使って組み込むことができます。

## includeとextend

### includeとは

includeは、モジュールのメソッドをクラスのインスタンスメソッドとして取り込むためのキーワードです。

#### 1. chapter9/module_include.rb ファイルを作成し、次のコードを記述してください。

```ruby
module Greeting
  def hello
    "Hello!"
  end
end

class Person
  include Greeting
  attr_accessor :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end
end

person = Person.new("太郎", 30)
puts person.hello
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter9/module_include.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter9/module_include.rb
Hello!
```

### まとめ

includeを使うことで、モジュールのメソッドをクラスのインスタンスメソッドとして取り込むことができます。

サンプルコードではPersonクラスにGreetingモジュールをincludeして、helloメソッドを使用できるようにしています。

### extendとは

extendは、モジュールのメソッドをクラスのクラスメソッドとして取り込むためのキーワードです。

#### 1. chapter9/module_extend.rb ファイルを作成し、次のコードを記述してください。

```ruby
module Greeting
  def hello
    "Hello!"
  end
end

class Person
  extend Greeting
end

puts Person.hello
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter9/module_extend.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter9/module_extend.rb
Hello!
```

### まとめ

extendを使うことで、モジュールのメソッドをクラスのクラスメソッドとして取り込むことができます。

サンプルコードでは、PersonクラスにGreetingモジュールをextendして、helloメソッドをクラスメソッドとして使用できるようにしています。

extendでGreetingモジュールを取り込んでhelloメソッドを使えるようにすると下記の例のようにクラスメソッドとして定義した時と同じように使うことができます。

**例**

```ruby
class Person
  def self.hello
    "Hello!"
  end
end
```

## モジュールに定数を定義する

#### 1. chapter9/module_constant.rb ファイルを作成し、次のコードを記述してください。

```ruby
module Greeting
  HELLO = "Hello!"
end

class Person
  include Greeting

  def hello
    HELLO
  end
end

person = Person.new
puts person.hello
puts Greeting::HELLO
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter9/module_constant.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter9/module_constant.rb
Hello!
Hello!
```

### まとめ

モジュール定義した定数はincludeを使ってクラスに取り込むことができます。

サンプルコードでは、GreetingモジュールにHELLO定数を定義し、PersonクラスにincludeしてHELLO定数を使用しています。

また、モジュールに定義した定数は`モジュール名::定数名`でアクセスすることができます。