# Railsデバッグガイド

## インプットフェーズ

理解する必要がある単語や概念について説明します。よく読んで理解を深めてください。

### デバッグとは

デバッグとは、プログラムに発生した不具合（バグ）を見つけ出し、修正する作業のことを指します。

プログラムのバグの原因を特定するには、処理の手順を細かく分解し、1つずつ丁寧に確認していく必要があります。

#### 例：スマートフォンのカメラが使えないとき

例えば、「スマートフォンのカメラが使えない」と電話で相談された場合、原因を特定するために以下のような手順で確認していくでしょう。

1. スマートフォンが起動できているか
2. スマートフォンのカメラアプリを起動できているか
3. カメラアプリのシャッターボタンが押せているか

このように、写真を撮るという一連の手順を分解し、各段階に問題がないかを確認していきます。

#### プログラムにおけるデバッグも同じ

プログラムでも同様に、実行の流れを一つ一つ確認しながら、不具合がどこで起きているかを探していく作業がデバッグです。

---

### Gemとは

デバッグを実施する前に Gem について学びます。

Gem（ジェム）とは、Rubyプログラミング言語のためのパッケージ管理システムにおいて使われる「ソフトウェアパッケージ」のことです。

Gemには、Rubyの拡張機能やライブラリがまとめられており、必要に応じて追加・利用することができます。

Gemは、RubyGemsというツールによって管理されており、リポジトリからGemをダウンロード・インストールすることで、簡単に機能を追加できます。

#### Gemを使うメリット

- 他の開発者が作成した便利な機能を手軽に利用できる
- 開発効率やコードの品質が向上する
- 自分でGemを作成・公開することも可能で、他のRuby開発者と共有できる

Railsプロジェクトでは、これらのGemはBundlerを使って一括で管理されます。

---

### Bundlerとは

Bundler（バンドラー）は、Rubyプログラミング言語向けの依存関係管理ツールです。

Bundlerを使用すると、Rubyプロジェクトに必要なGemパッケージやそのバージョンの管理が容易になります。

Bundlerは主にRuby on RailsなどのRubyベースのアプリケーションで使用され、Gemパッケージのバージョン管理や依存関係の解決を効率的に行うための重要なツールです。

---

### Railsコンソールとは

Rails コンソールは、アプリケーションを対話的に操作できるツールです。

これを使うことで、アプリケーションの環境と同じ状態で以下のような操作が行えます。

- モデルのインスタンスを作成・保存・取得
- データベースの中身を直接確認・変更
- コードやメソッドの挙動を試す
- エラー発生時に変数やメソッドの状態を確認して原因を探る

Railsコンソールは、デバッグや調査にとても便利なツールです。

エラーの原因を特定する際にも、直接値を確認することで、問題の特定と修正に役立ちます。

---

## 実装フェーズ

### gem 'better_errors'導入

#### Gemfile に better_errors を追加する

まず、アプリケーションのルートディレクトリにあるGemfileを開き、以下のように `better_errors` と `binding_of_caller` を追記してください。

50行目あたりを以下のように編集してください。 `do`と`end` は Ruby のブロック構文で、この範囲内に記述することで、開発・テスト環境専用のGemとして指定されます。

```ruby
# Gemfile
group :development, :test do
  ...省略

  gem 'better_errors'
  gem 'binding_of_caller'

  ...省略
end
```

##### Gemfileとは

- Gemfile は、Railsアプリケーションで使用する **Gemの一覧やそのバージョン** を定義するファイルです
- GemfileをもとにGemをインストール・管理するのが **Bundler** です
- ※ このカリキュラムでは Docker を使用しているため、Bundler のインストール手順は不要です。すでに環境に含まれています

#### Gemfile 変更の確認

Gemfile を編集したら、変更内容を以下のコマンドで確認してみましょう。

```bash
$ git diff
```

Gemfileの変更点が表示されます。

#### Gem をインストールする

確認が出来たら、以下のコマンドをターミナルで実行して、Gemfile に追加したGemをインストールします。

```bash
$ docker compose run web bundle install
```

このコマンドは、Gemfile に記載された Gem のうち、まだインストールされていないものをインストールしてくれます。

#### better_errors の設定（IPアドレスの許可）

Docker環境では、`better_errors` が正しく動作しないことがあります。そのため、特定のIPアドレスを許可する設定が必要です。

`config/environments/development.rb` ファイルの中にある `Rails.application.configure do` ブロックの中に、以下の一文を追記してください。

```ruby
Rails.application.configure do
  BetterErrors::Middleware.allow_ip! "0.0.0.0/0"

  ...省略
end
```

※ こちらはDocker環境においてbetter_errorsが反映されてない不具合への対処方法なので、詳細については割愛させていただきます。

#### Railsサーバー（コンテナ）の再起動

Gem や設定ファイルを変更した場合は、Rails サーバー（コンテナ）を再起動する必要があります。

以下の手順でコンテナを再起動してください。

1. `docker compose up` で起動しているターミナルを `Ctrl + C` で一度停止
2. 再度以下のコマンドを実行

```bash
$ docker compose up
```

3. 別のターミナルで以下のコマンドを実行

```bash
$ docker compose exec web bin/dev
```

以上で、`better_errors` の導入は完了です。

エラーが発生したときに、`better_errors` のリッチなエラー画面が表示されれば、導入成功です（※Routing Error など一部の例外は除く）。

---

### デバッグ実践の前準備

デバッグを始める前に、Users テーブルにいくつかのレコードを登録しておきましょう。

データの追加方法については、ブラウザで操作してください。

---

## better_errorsを用いたデバッグ方法

ここからは、`better_errors` を使って実際にデバッグしていきます。

### raise を使って意図的にエラーを発生させる

まずは、`raise` メソッドを使って意図的にエラーを発生させてみましょう。

以下のように、`app/controllers/users_controller.rb` の `index` アクションに `raise` を追記します。

```ruby
# app/controllers/users_controller.rb
def index
  @users = User.all
  raise
end
```

### /users にアクセスしてエラー画面を確認

上記の状態で `/users` にアクセスすると、エラー画面が表示されます。

これは、例外エラー（バグなどで発生するエラー）が発生した際に表示される、`better_errors` の画面です。

`raise` は、例外エラーを意図的に発生させるためのメソッドです。

### エラー画面の見方・使い方

- 画面右側には、エラーが発生した **ファイル名とソースコード** が表示されます
- その下には **入力フォーム** があり、リアルタイムでRubyコードを試すことができます

たとえば、以下のような式を入力してみましょう。

```ruby
1 + 1
10 * 2
```

結果がすぐに返されます。

さらに、以下のように `@users` を入力して実行してみてください。

```ruby
@users
#<ActiveRecord::Relation [#<User id: xxx, name: "xxx", age: xxx, created_at: "2xxx-xx-xx xx:xx:xx.xxxxxxxxx +0000", updated_at: "2xxx-xx-xx xx:xx:xx.xxxxxxxxx +0000">, .......]>
```

上記のように、`@users` に格納されている `User.all` の結果が表示されます。

このように、`raise` を使用して意図的にプログラムを停止させることで、**その時点で変数に何が入っているか・どの処理が実行されているか** を確認することができます。

### raise を使ってほしい理由

プログラミングを始めたばかりのうちは、「このコードが実際に何をしているのか」「どこで何が起きているのか」が見えにくいことがあります。

そんな時、`raise` を使ってプログラムの流れを途中で止め、`better_errors` を使ってその時点の状態を観察することで、プログラムの動作を"見える化"することができます。

### 最後に：raise を削除する

`better_errors` の使い方が理解できたら、先ほど追記した `raise` は削除しておきましょう。

```ruby
def index
  @users = User.all
end
```

---

## Railsコンソールを用いたデバッグ方法

Railsコンソールを使用したデバッグ方法について解説します。

### Railsコンソールを起動する

まず、ターミナルからRailsのコンソールを起動します。

以下のコマンドを、`docker compose up`や`bin/dev`を実行しているターミナルとは別のターミナルで実行してください。

```bash
$ docker compose exec web bin/rails console
```

以下のような表示が出たら、コンソールが正常に起動しています。

### Railsコンソールとは

Railsコンソールは、ターミナル上でRubyのコードやRailsのメソッドを対話的に実行・確認できるツールです。

先程のbetter_errorsの入力フォームと似ており、たとえば以下のようなコードを実行できます。

```ruby
1 + 1
User.all
```

プログラムの動作やデータの状態を手軽に確認することができるため、デバッグやテストに非常に便利です。

確認が終わったら、以下のコマンドで一度終了しておきましょう。

```ruby
exit
```

### データベースを初期化し、Railsコンソールを再起動

ここからは、もう少し踏み込んでRailsコンソールを使ってみましょう。

まずは、以下のコマンドを実行してデータベースを初期化します。

以下のコマンドを、`docker compose up`や`bin/dev`を実行しているターミナルとは別のターミナルで実行してください。

```bash
# 分かりやすくするために、以下のコマンドを実行してデータベースを初期化します
$ docker compose exec web rails db:drop
$ docker compose exec web rails db:create
$ docker compose exec web rails db:migrate
```

続いて、Railsコンソールを再び起動します。

```bash
# Railsコンソールを立ち上げるコマンドです
$ docker compose exec web rails console
```

### Userモデルのインスタンスを作成してみる

Railsコンソールが立ち上がったら、以下を実行してください。

```ruby
User.new
```

すると、以下のように User モデルのインスタンスが表示されます。

```ruby
#<User id: nil, name: nil, age: nil, created_at: nil, updated_at: nil>
```

この表示から、Userモデルにはどのようなカラムがあるか（`id`, `name`, `age` など） が分かります。

テーブル構造を把握したいときにも役立ちます。

### データを作成・確認してみる

次に、以下のコマンドを1つずつコピー＆ペーストして実行してみてください。

※ 各メソッドの意味は別の課題で学ぶので、今は理解しなくても大丈夫です。

```ruby
User.create(name: 'RUNTEQ', age: 100)
User.create(name: 'TEST', age: 10, skill: 'Ruby, Ruby on Rails, ...')
User.all
User.count
```

| コマンド | 解説 |
|---------|------|
| `User.create(name: 'RUNTEQ', age: 100)` | 正常にレコードが作成されます。COMMIT と表示されることで確認できます |
| `User.create(name: 'TEST', age: 10, skill: ...)` | skill カラムは存在しないため、UnknownAttributeError の例外が発生します |
| `User.all` | 現在保存されているユーザー情報の一覧が表示されます。エラーが出なかったレコードのみ確認できます |
| `User.count` | レコード数を取得し、上記の状況を裏付けます |

### ブラウザで確認してみる

次に、ブラウザで `/users` にアクセスしてみてください。

先ほど Railsコンソール で登録したユーザー情報が表示されているはずです。

このように、プログラムの挙動を確認したいときや、新しいメソッドを試したいときに、Railsコンソールはとても便利です。

動作の確認や、概念の理解を深める助けになります。

### リクエストからレスポンスまでの流れ

ここまでの操作は、リクエストからレスポンスまでの流れの中でも、特に「情報の取得」に関わる部分の確認に役立ちます。

Railsアプリケーション全体の流れの中で、どこに問題があるのかを切り分ける際に、「本当にデータは取得できているか？」という確認は、非常に重要です。

---

## デバッグ体験

ここから自動レビュー課題手前までの記述は、本課題のクリアとは関係がありません。

行わなくても課題はクリアできますが、エラーへのアプローチに慣れるためにも実際に手を動かしながら取り組んでください。

課題1に掲載されていたリクエストからレスポンスまでの流れの図を横に置きながら処理の流れを意識してください。

今回は全部で4つのデバッグを行います。

複数のエラーが同時に発生することもあるので、一つ一つ対処していきましょう。

---

### 1. Routing Error

まずは以下のURLにアクセスしてください。

```
http://localhost:3000/runteq
```

次のようなエラー画面が表示されるはずです。

下線が引かれている部分を読むと「Routing Error」「No route matches [GET] "/runteq"」とあります。

#### 原因と解決方法

このエラーは、`GET /runteq` に対応するルーティングが存在しないことが原因です。

具体的には `No route matches [GET] "/runteq"` （HTTPメソッドのGETメソッドで `/runteq` にリクエストされたときのルーティングが存在しない） とあります。

実際に以下にアクセスしてみてください。

```
http://localhost:3000/rails/info/routes
```

`GET /runteq` が定義されていないことが確認できます。

"リクエストからレスポンスまでの流れ"でいうと、「リクエスト → ルーティング」の段階で、該当するルートが見つからなかったためにエラーが発生しています。

#### 対処手順

`config/routes.rb` に以下を追加してください。

```ruby
get '/runteq', to: 'top#runteq'
```

保存後、再び以下にアクセスしてルートが追加されているか確認しましょう。

```
http://localhost:3000/rails/info/routes
```

`runteq_path` の行が表示されていれば成功です。

その状態で `http://localhost:3000/runteq` にアクセスすると、次は別のエラーが出るはずです。

「`AbstractController::ActionNotFound`」「`The action 'runteq' could not be found for TopController`」というエラー画面に変わっていればOKです。

---

### 2. ActionNotFound

次に表示されるエラー画面です。

#### 原因と解決方法

このエラーは、ルーティングで指定したコントローラ・アクションが存在しないことが原因です。

具体的には `The action 'runteq' could not be found for TopController` とあるように TopController に `runteq` アクションが見つからなかったとあります。

"リクエストからレスポンスまでの流れ"でいうと、ルーティングで指定されたコントローラーやアクションを探しにいった際に、実際には存在しなかったため、エラーが発生しています。

#### 対処手順

以下のように `app/controllers/top_controller.rb` を編集し、`runteq` アクションを追加してください。

```ruby
class TopController < ApplicationController
  def index
  end

  def runteq
  end
end
```

保存してブラウザを更新すると、今度は次のエラーが表示されるはずです。

エラー内容が「`ActionController::MissingExactTemplate`」「`TopController#runteq is missing a template for request formats: text/html`」となっていたらOKです。

---

### 3. MissingExactTemplate

`http://localhost:3000/runteq` にアクセスすると、今度は以下のようなエラー画面が表示されるはずです。

#### 原因と解決方法

このエラーは、指定されたアクションに対応するビューファイルが存在しない場合に表示されます。

具体的には `TopController#runteq is missing a template for request formats: text/html` とあるように TopController の `runteq` アクションに対応するビューファイル（`app/views/top/runteq.html.erb`）が見つからなかったとあります。

##### エラーの流れ

"リクエストからレスポンスまでの流れ" でいうと 「コントローラー → ビュー 」の部分で、テンプレートファイルが無いために処理が止まっています。

#### 対処手順

対応するビューファイルを作成すれば解決できます。

##### テンプレートファイルの作成

以下のコマンドをターミナルにて実行してください。

```bash
$ touch app/views/top/runteq.html.erb
```

##### ファイルの編集

作成したファイルに以下のように記述してください。

```erb
<h1>runteq.html.erb</h1>
```

##### ブラウザで確認

`http://localhost:3000/runteq` にアクセスして、画面が表示されればOKです。

---

### 4. NoMethodError

ビューファイルに、コントローラーから渡っていないインスタンス変数を使ってみましょう。

以下のように `runteq.html.erb` を編集してください。

```erb
<!-- app/views/top/runteq.html.erb -->
<h1>runteq.html.erb</h1>

<br />

<h1><%= @robot[:name] %></h1>
```

この状態でブラウザを更新すると、次のようなエラーが発生するはずです。

```
NoMethodError
undefined method `[]' for nil:NilClass
```

#### 原因と解決方法

このエラーは、`@robot` が `nil` なのに、`[:name]` を呼び出そうとしたために発生しています。

NoMethodError はオブジェクトに定義されていないメソッドを呼び出した際に発生するエラーになります。

エラー画面のコードが表示されている部分にマーカーが付いている箇所がエラー発生箇所になります。

Better Errors の入力欄に以下を入力すると、それが確認できます。

```ruby
@robot        # => nil
@robot[:name] # => NoMethodError: undefined method `[]' for nil:NilClass
```

"リクエストからレスポンスまでの流れ"でいうと、ビューで使っているインスタンス変数が、コントローラーから渡ってきていないということです。

##### 処理の流れとエラー発生ポイント

「リクエスト → コントローラー → ビュー → エラー」

ビュー側で `@robot` を使おうとしたけれど、コントローラーで定義されていないため `nil` となり、`[]` が使えずエラーになっています。

#### 対処手順

以下のように `app/controllers/top_controller.rb` を編集し、`@robot` に値をセットしてください。

※runteqアクションにある `@robot` を `robot` （@を取る）にすると、NoMethodError 画面になるのも確認してください

```ruby
class TopController < ApplicationController
  def index
  end

  def runteq
    @robot = {name: 'ロボらんてくん'}
  end
end
```

保存後、ブラウザを更新して、正しく表示されればOKです。

---

## まとめ

ここまで体験したように、エラーが発生した際は

- 表示されているエラーメッセージ
- コンソールやログの出力
- Rails内部の処理の流れ（ルーティング → コントローラー → ビュー）

を元に状況を分析し、**「こうすれば直るのでは？」という仮説を立てて → 実際に試す**

という **仮説検証のサイクル** を回すことが、技術力を伸ばす上でとても重要です。

最初は難しく感じるかもしれませんが、このプロセスを繰り返すことで、エラーに強くなっていきます。焦らず、一歩ずつ慣れていきましょう！