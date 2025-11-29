# 8章 クラスについて

## クラスの基本

### Rubyで扱われるデータの特徴

Rubyで扱われる全てのデータはオブジェクトとして扱われます。
オブジェクトはクラスに属しており、クラスという設計図に基づいて作成されたもののことです。

例えば、"あ"という文字列はStringクラスから生成されたオブジェクトであり、1という数値はIntegerクラスから生成されたオブジェクトです。

プログラミング言語によっては、数やそれ以外のプリミティブな型はオブジェクトとしては扱われませんが、Rubyでは全てのデータがオブジェクトとして扱われるという特徴があります。

### クラスとは

クラスはオブジェクトの設計図です。クラスには、オブジェクトが持つべきデータや振る舞いを定義するためのメソッドが含まれます。

クラスを使うことで、同じような機能を持つオブジェクトを簡単に作成することができます。

### クラスの定義

#### 1. chapter8ディレクトリを作成してください。

```bash
mkdir chapter8
```

#### 2. chapter8/class_example.rbファイルを作成し、次のコードを記述してください。

```ruby
class Person
end

person = Person.new
p person
```

#### 3. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter8/class_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/class_example.rb
#<Person:0x00007f1338d44520>
```

※コンテナを止めてしまった人は下記のコマンドでコンテナにアクセスしましょう。

```bash
docker compose run --rm app bash
```

### まとめ

クラスはClassキーワードを使って定義します。Classの後にクラス名を記述し、endで囲うことでクラスを定義します。

サンプルコードでは、Personというクラスを定義しています。

`Person.new`は、Personクラスのインスタンスを生成するためのコードです。

`#<Person:0x00007f1338d44520>`のPersonはクラスの名を表し、0x00007f1338d44520はそのインスタンスのオブジェクトIDを示しています。

オブジェクトIDは、Rubyがオブジェクトを識別するための一意のIDで、実行するたびに異なる値が生成されます。

インスタンスは、クラスの設計図に基づいて作成されたオブジェクトのことで、クラスに属性やメソッドを定義することで柔軟にオブジェクトを生成することができます。

### クラスにメソッド定義する

#### 1. chapter8/class_example.rbファイルを以下の形に変更してください。

```ruby
class Person
  def greet
    "Hello!"
  end
end

person = Person.new
puts person.greet
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter8/class_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/class_example.rb
#<Person:0x00007f0db612f618>
Hello!
```

### まとめ

クラスにメソッドを定義することで、オブジェクトに振る舞いを持たせることができます。

クラスにメソッドを定義するためにはClassキーワードからendまでの間にメソッドを定義します。

`person.greet`は、Personクラスのインスタンスに対してgreetメソッドを呼び出しているため、"Hello!"という文字列が返って来てputsメソッドで出力されています。

## initializeメソッドの使い方

### initializeメソッドとは？

initializeメソッドは、クラスのインスタンスが生成されるときに自動的に呼び出される特別なメソッドです。このメソッドを使って、インスタンスの初期化を行います。

### initializeメソッドを使ってクラスに初期値を設定する

#### 1. chapter8/initialize_example.rbファイルを作成し、次のコードを記述してください。

```ruby
class Person
  def initialize(name, age)
    @name = name
    @age = age
  end

  def info
    "#{@name}, #{@age}歳"
  end
end

person = Person.new("太郎", 30)
p person
puts person.info
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter8/initialize_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/initialize_example.rb
#<Person:0x00007f28e87c4300 @name="太郎", @age=30>
太郎, 30歳
```

### まとめ

initializeメソッドは、クラスのインスタンスが生成されるときに自動的に呼び出される特別なメソッドです。

サンプルコードでは、initializeメソッドを使ってPersonクラスのインスタンスを生成するときに、nameとageという初期値を設定しています。

`Person.new`に渡している引数がそのままinitializeメソッドの引数に渡されています。

実行結果で出力されている`<Person:0x00007f28e87c4300 @name="太郎", @age=30>`の`@name="太郎"`と`@age=30`は、インスタンスが使用できる変数であり、インスタンス変数と呼ばれます。

インスタンス変数が定義されたことでinfoメソッドを呼び出したときに、太郎, 30歳という文字列が返ってきています。

## インスタンス変数とは？

インスタンス変数は、クラスのインスタンスごとに異なる値を保持するために使用されます。

通常の変数はメソッドの中でのみ使用できるといったルールがありますが、インスタンス変数はクラスのインスタンスの中のメソッドであればどこからでも値を参照することができます。

### インスタンス変数の定義

#### 1. chapter8/instance_variable_example.rbファイルを作成し、次のコードを記述してください。

```ruby
class Person
  def initialize(name, age)
    @name = name
    @age = age
    country = "Japan"
  end

  def info
    "#{@name}, #{@age}歳, #{country}出身"
  end
end

person = Person.new("太郎", 30)
p person
puts person.info
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter8/instance_variable_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/instance_variable_example.rb
#<Person:0x00007f217094f280 @name="太郎", @age=30>

chapter8/instance_variable_example.rb:9:in `info': undefined local variable or method `country' for #<Person:0x00007f217094f280 @name="太郎", @age=30> (NameError) 
from chapter8/instance_variable_example.rb:15:in `<main>'
```

country変数はローカル変数として定義されているため、infoメソッド内で参照することが出来ずエラーが発生しています。

#### 3. chapter8/instance_variable_example.rbファイルを以下の形に変更してください。

```ruby
class Person
  def initialize(name, age)
    @name = name
    @age = age
    @country = "Japan"
  end

  def info
    "#{@name}, #{@age}歳, #{@country}出身"
  end
end

person = Person.new("太郎", 30)
p person
puts person.info
```

#### 4. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter8/instance_variable_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/instance_variable_example.rb
#<Person:0x00007f217094f280 @name="太郎", @age=30, @country="Japan">
太郎, 30歳, Japan出身
```

### まとめ

インスタンス変数は、クラスのインスタンスごとに異なる値を保持するために使用されます。

通常の変数はメソッドの中でのみ使用できるといったルールがありますが、インスタンス変数はクラスのインスタンスの中のメソッドであればどこからでも値を参照することができます。

サンプルコードでは、ローカル変数でcountryを定義すると、infoメソッド内で参照することができないためエラーが発生することを確認しました。

その後、`@country = "Japan"`としてインスタンス変数を定義することで、infoメソッド内で参照することができるようになりました。

インスタンス変数はインスタンス毎に設定される値のためデータごとに持たせる値を変えて異なる振る舞いをさせることができます。

## ゲッターとセッター

### ゲッターとは

ゲッター (getter) は、インスタンス変数の値を取得するためのメソッドです。ゲッターを使うことで、インスタンス変数の値を外部から読み取ることができます。

#### 1. chapter8/getter_setter_example.rbファイルを作成し、次のコードを記述してください。

```ruby
class Person
  def initialize(name, age)
    @name = name
    @age = age
  end

  def name
    @name
  end

  def age
    @age
  end
end

person = Person.new("太郎", 30)
puts person.name
puts person.age
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter8/getter_setter_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/getter_setter_example.rb
太郎
30
```

### まとめ

ゲッターはインスタンス変数の値を取得するためのメソッドです。ゲッターを使うことで、インスタンス変数の値を外部から読み取ることができます。

サンプルコードでは、nameメソッドとageメソッドを使って、インスタンス変数の値を取得出来るようにしています。

### セッターとは

セッター (setter) は、インスタンス変数の値を設定するためのメソッドです。セッターを使うことで、インスタンス変数の値を外部から変更することができます。

#### 1. chapter8/getter_setter_example.rbファイルを以下の形に変更してください。

```ruby
class Person
  def initialize(name, age)
    @name = name
    @age = age
  end

  def name
    @name
  end

  def age
    @age
  end

  def name=(name)
    @name = name
  end

  def age=(age)
    @age = age
  end
end

person = Person.new("太郎", 30)
person.name = "花子"
person.age = 25
puts person.name
puts person.age
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter8/getter_setter_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/getter_setter_example.rb
花子
25
```

### まとめ

セッターはインスタンス変数の値を設定するためのメソッドです。セッターを使うことで、インスタンス変数の値を外部から変更することができます。

サンプルコードでは、name=メソッドとage=メソッドを使って、インスタンス変数の値を設定できるようにしています。

セッターを使って名前を花子に変更し、年齢を25に変更することが出来ています。

### attr_accessorを使ったゲッターとセッターの定義

attr_accessorを使うことで、ゲッターとセッターを簡単に定義することができます。

#### 1. chapter8/attr_accessor_example.rbファイルを作成し、次のコードを記述してください。

```ruby
class Person
  attr_accessor :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end
end

person = Person.new("太郎", 30)
puts person.name
puts person.age

person.name = "花子"
person.age = 25
puts person.name
puts person.age
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行します。(コンテナ内で実行してください)

```bash
ruby chapter8/attr_accessor_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/attr_accessor_example.rb
太郎
30
花子
25
```

### まとめ

attr_accessorを使うことで、ゲッターとセッターを簡単に定義することができます。

サンプルコードでは、`attr_accessor :name, :age`を使って、nameメソッドとname=メソッド、ageメソッドとage=メソッドを定義しています。

## インスタンスメソッドとクラスメソッドとプライベートメソッド

### インスタンスメソッドとは

インスタンスメソッドは、クラスのインスタンスによって呼び出されるメソッドです。インスタンス変数を操作したり、インスタンスごとに異なる動作を行うために使用されます。

### インスタンスメソッドの定義

#### 1. chapter8/instance_method_example.rbファイルを作成し、次のコードを記述してください。

```ruby
class Person
  attr_accessor :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end

  def introduce_text
    "私の名前は#{name}です。#{age}才です"
  end
end

tarou = Person.new("太郎", "30")
puts tarou.introduce_text

hanako = Person.new("花子", "25")
puts hanako.introduce_text
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。

```bash
ruby chapter8/instance_method_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/instance_method_example.rb
私の名前は太郎です。30才です
私の名前は花子です。25才です
```

### まとめ

インスタンスメソッドを使うことで、同じクラスの異なるインスタンスに対して異なる動作を簡単に実現できます。

### クラスメソッドとは

クラスメソッドは、クラス自体に関連付けられたメソッドです。インスタンスからは呼び出すことができず、クラス自体から呼び出すことができます。

クラスメソッドを定義するときは、メソッド名の前に`self.`を付けます。

### クラスメソッドの定義

#### 1. chapter8/class_method_example.rbファイルを作成し、次のコードを記述してください。

```ruby
class Person
  attr_accessor :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end

  def introduce_text
    "私の名前は#{name}です。#{age}才です"
  end

  def self.adulthood_age_text
    "成人年齢は18才です"
  end
end

person = Person.new("太郎", 30)
puts person.adulthood_age_text
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。

```bash
ruby chapter8/class_method_example.rb
```

**実行結果**

```
I have no name!@4d904ed79b93:/app$ ruby chapter8/class_method_example.rb
chapter8/class_method_example.rb:19:in `<main>': undefined method `adulthood_age_text' for #<Person:0x00007f8fa0d2efb0 @name="太郎", @age=30> (NoMethodError)

  puts person.adulthood_age_text
             ^^^^^^^^^^^^^^^^^^^
```

クラスメソッドはインスタンスから呼び出すことができないため、エラーが発生しています。

#### 3. chapter8/class_method_example.rbファイルを以下の形に変更してください。

```ruby
class Person
  attr_accessor :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end

  def introduce_text
    "私の名前は#{name}です。#{age}才です"
  end

  def self.adulthood_age_text
    "成人年齢は18才です"
  end
end

puts Person.adulthood_age_text
```

#### 4. ファイルを保存後、以下のコマンドでスクリプトを実行してください。

```bash
ruby chapter8/class_method_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/class_method_example.rb
成人年齢は18才です
```

### まとめ

クラスメソッドを使うことで、クラス全体に関連する操作を簡単に実行できます。

サンプルコードでは、クラスメソッドをインスタンスから呼び出すことができないことを確認し、クラスから呼び出すことで正常に動作することを確認しました。

### privateメソッドとは？

privateメソッドは、そのクラスの内部からのみ呼び出すことができるメソッドです。

外部から直接呼び出すことはできません。

クラス内での補助的な処理や、外部に公開したくないメソッドを定義するために使用されます。

### privateメソッドの定義

#### 1. chapter8/private_method_example.rbファイルを作成し、次のコードを記述してください。

```ruby
class Person
  attr_accessor :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end

  def introduce_text
    "私の名前は#{name}です。#{age}才です"
  end
  
  private

  def secret
    '内緒'
  end
end
  
person = Person.new("太郎", 30)
puts "私の秘密は#{person.secret}です。"
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。

```bash
ruby chapter8/private_method_example.rb
```

**実行結果**

```
I have no name!@4d904ed79b93:/app$ ruby chapter8/private_method_example.rb
chapter8/private_method_example.rb:21:in `<main>': private method `secret' called for #<Person:0x00007fcac8fe3950 @name="太郎", @age=30> (NoMethodError)
```

privateメソッドは外部から呼び出すことができないため、エラーが発生しています。

#### 3. chapter8/private_method_example.rbファイルを以下の形に変更してください。

```ruby
class Person
  attr_accessor :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end

  def introduce_text
    "私の名前は#{name}です。#{age}才です。私の秘密は#{secret}です。"
  end
  
  private

  def secret
    '内緒'
  end
end
  
person = Person.new("太郎", 30)
puts person.introduce_text
```

#### 4. ファイルを保存後、以下のコマンドでスクリプトを実行してください。

```bash
ruby chapter8/private_method_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/private_method_example.rb
私の名前は太郎です。30才です。私の秘密は内緒です。
```

### まとめ

privateメソッドは、そのクラスの内部からのみ呼び出すことができるメソッドです。

サンプルコードでは、privateメソッドを使って、外部から呼び出すことができないことを確認し、クラス内部から呼び出すことで正常に動作することを確認しました。

## クラスの継承

### 継承とは

継承は、あるクラスを基にして新しいクラスを作成することができる機能です。

新しいクラスは、元のクラスの属性やメソッドを引き継ぐことができます。

継承を使うことで、親クラスの機能を再利用しながら、新しい機能を追加したり変更したりすることができます。

#### 1. chapter8/inheritance_example.rbファイルを作成し、次のコードを記述してください。

```ruby
class Person
  attr_accessor :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end

  def introduce_text
    "私の名前は#{name}です。#{age}才です。"
  end
end

class Employee < Person
  def job_text
    "私は社員です。"
  end
end

employee = Employee.new("太郎", 30)
puts employee.introduce_text
puts employee.job_text
```

#### 2. ファイルを保存後、以下のコマンドでスクリプトを実行してください。(コンテナ内で実行してください)

```bash
ruby chapter8/inheritance_example.rb
```

**実行結果**

```
root@4d904ed79b93:/app$ ruby chapter8/inheritance_example.rb
私の名前は太郎です。30才です。
私は社員です。
```

### まとめ

継承を使うことで、あるクラスを基にして新しいクラスを作成することができます。

サンプルコードでは、Personクラスを基にしてEmployeeクラスを作成し、新しい機能を追加することができました。

Employeeクラスから作られたインスタンスは、Personクラスの属性やメソッドを引き継ぎ、新しいメソッドを追加することが出来るため、Employeeクラスのインスタンスからはintroduce_textメソッドとjob_textメソッドを呼び出すことが出来ます。