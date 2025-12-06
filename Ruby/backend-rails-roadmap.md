# Rails CRUD学習ガイド

## 学習の意識ポイント

- masterブランチを最新状態にして、そこから作業ブランチを作成＆移動して開発に入るフローに慣れる
- リクエストからレスポンスまでの流れを掴む
- CRUD機能を体験を通して理解する
- データベースとRailsは別物であることを掴む
- データベースの変更にはマイグレーションファイルを介することを理解する
- 課題に取り組むアプローチを理解する

## AI活用の心得 - 今回のポイント -

プログラミング学習では、分からないことはまず自分で調べる姿勢が大切です。AIはエラーや理解できない概念を調べる基本手段として便利なものですが、リスクをきちんと理解して使用しないと学習した内容が身につかなかったり、間違った情報をインプットしてしまうことにも繋がりかねないのでAIを使う際の心得をしっかりと用意しておきましょう。

以下の習慣を身につけると、受け身にならず、自分で調べて解決しようとする姿勢と自走力が身につき、学習の効率も上がり、より深く理解できるようになります。

### AIを使う際に意識しておくこと

#### ハルシネーションのリスクを回避する

LLMは質問に合わせて文章が繋がりやすいものを返答として出力するという特性から、文章としてはいいように見えるが、出てくる用語が架空のものであったり、間違った使い方・説明がされている場合があります。

出力をそのまま使わず、必ず出力されたものを追加でWeb検索で調べたり、検証を行い、概念理解の"とっかかり"や壁打ちなどを行うための補助役として使用するようにしましょう。

#### 必ず自分主導で使用する

AIを使うときは自分が実現したいことの「目的」「課題」「考えられる原因」「解決方法」などを自分の頭の中で整理した上で、補助輪として活用しましょう。

### AI講師に聞く際のプロンプト例

*(プロンプト例が記載されていれば追加)*

---

## インプットフェーズ

理解する必要がある単語や概念について説明します。よく読んで理解を深めてください。

### CRUD

CRUDとは、データベース管理システムに必要とされる4つの主要な機能、「作成（Create）」「読み出し（Read）」「更新（Update）」「削除（Delete）」をそれぞれ頭文字で表したもののことです。

| 操作名 | 説明 | 例 | 対応するSQL文 |
|--------|------|-----|---------------|
| Create | 作成 | 新しいデータをデータベースに追加する操作 | 新しい顧客情報や製品データの登録 | INSERT |
| Read | 読み取り | 既存のデータを取得・閲覧する操作 | 条件に合致するデータの検索、全データの一覧表示 | SELECT |
| Update | 更新 | 既存のデータを修正する操作 | 顧客の住所変更、商品価格の改定 | UPDATE |
| Delete | 削除 | 不要になったデータを削除する操作 | 古い記録の除去、誤入力データの消去 | DELETE |

CRUDは、ほぼすべてのデータ管理システムやアプリケーションの基本機能となっています。これらの操作を適切に実装することで、データの整合性を保ちながら、効率的なデータ管理が可能になります。

### 7つのアクション

Ruby on Railsでよく言われる7つのアクションとは、index、new、create、edit、show、update、destroyになります。以下にそれぞれのアクションに関して説明します。

| アクション名 | 説明 |
|------------|------|
| index | 一覧表示(全レコードの表示) |
| new | 新規レコード作成用の画面を表示 |
| create | 新しいレコードを作成する |
| edit | 既存レコードの編集画面を表示 |
| show | 単一レコードの詳細画面を表示 |
| update | レコードの内容を更新する |
| destroy | レコードを削除する |

---

## 実践フェーズ

### コンテナを立ち上げる

開発に取り組む前に開発ツールを下記の状態にしてください。

- **Docker Desktop**: 起動
- **VSCode**: 対象アプリケーションのコードを開けている状態で起動
- **ターミナル**:
  - `docker compose up` コマンド実行中
  - `docker compose exec web bin/dev` コマンド実行中
  - gitコマンドなどのコマンド入力を受け付けられる状態のターミナル

### docker compose exec web bin/rails generate scaffold コマンドを使ってUserのCRUD機能を実装する

#### docker compose exec web bin/rails generate scaffold user name:string age:integer コマンドを実行する

ターミナルにて以下のコマンドを実行してください。

```bash
$ docker compose exec web bin/rails generate scaffold user name:string age:integer
```

#### bin/rails generate scaffold コマンドについて

`bin/rails generate scaffold` コマンドは、Railsアプリケーションで基本的な **CRUD（作成、読み取り、更新、削除）機能** を持つリソースを迅速に生成するためのツールです。

このコマンドを実行すると、以下のファイルやコードが自動で生成されます。

- モデル
- マイグレーションファイル
- コントローラ
- ビュー(index, show, new, editなど)
- ルーティング設定
- テストファイル
- ヘルパーファイル

#### Scaffoldの使用に関する注意点

scaffold は **プロトタイピングや学習目的** では非常に便利ですが、実務での使用は慎重に検討すべきです。

##### 実務であまり使われない理由

- プロジェクトの要件と **完全に一致しないコード** が生成されることが多い
- **カスタマイズが必要** な場合、生成されたコードの修正が面倒
- **不要なコードやファイル** が含まれる可能性がある
- 予期せぬ箇所にバグや攻撃を受けるリスクを生む可能性がある

##### 開発者の一般的なアプローチ

多くの経験豊富な開発者は以下の方法を取ります。

- 必要な機能を **個別に生成**(model, controller などを分けて作成)
- 場合によっては **完全に手動で実装**

これにより、次のようなメリットがあります。

- アプリケーションの構造を **より細かく制御** できる
- **無駄なコード** を避けられる
- メンテナンスしやすく、セキュアな設計が可能

#### コマンドを実行した結果を確認する

`docker compose exec web bin/rails generate scaffold user name:string age:integer` コマンドを実行した際のログを確認してください。

`create` の横に書かれているものは生成されたディレクトリ・ファイルになります。構造化すると以下のようになります。

```
.
├── app
│   ├── controllers
│   │   └── users_controller.rb
│   ├── helpers
│   │   └── users_helper.rb
│   ├── models
│   │   └── user.rb
│   └── views
│       └── users
│           ├── index.json.jbuilder
│           ├── index.html.erb
│           ├── edit.html.erb
│           ├── show.json.jbuilder
│           ├── show.html.erb
│           ├── new.html.erb
│           ├── _form.html.erb
│           ├── _user.json.jbuilder
│           └── _user.html.erb
├── db
│   └── migrate
│       └── 20yymmddxxxxxx_create_users.rb
└── spec
    ├── factories
    │   └── users.rb
    ├── helpers
    │   └── users_helper_spec.rb
    ├── models
    │   └── user_spec.rb
    ├── requests
    │   └── users_spec.rb
    ├── routing
    │   └── users_routing_spec.rb
    └── views
        └── users
            ├── edit.html.erb_spec.rb
            ├── index.html.erb_spec.rb
            ├── new.html.erb_spec.rb
            └── show.html.erb_spec.rb
```

### データベースにマイグレーションファイルを適用する

#### docker compose exec web bin/rails db:migrate コマンドを実行する

ターミナルにて以下のコマンドを実行してください。

```bash
$ docker compose exec web bin/rails db:migrate

$ docker compose exec web bin/rails db:migrate:status   # マイグレーションファイルの適応状況を表示するコマンドです
```

#### bin/rails db:migrate コマンドについて

`bin/rails db:migrate` は **マイグレーションを実行** するためのコマンドです。

このコマンドを実行すると、以下のような処理が行われます。

##### 主な処理内容

| 処理内容 | 説明 |
|---------|------|
| 未実行のマイグレーションの実行 | change または up メソッドが定義された、未実行のマイグレーションファイルを順番に実行します |
| マイグレーションの順序 | マイグレーションファイルの **日付(タイムスタンプ)** を基に実行順が決まります |
| db:schema:dump の自動実行 | マイグレーション後、自動で db:schema:dump が実行され、**db/schema.rb** が最新のスキーマ構造に更新されます |

### サイドバーにリンクを設置する

#### 編集権限の変更(Windowsの方のみ)

Windowsの場合、先程の `docker compose exec web bin/rails generate ...` コマンドで生成したファイルは権限を変更する必要があります。

今後も権限エラーが発生した場合は、以下のコマンドを実行してください。

```bash
$ sudo chown -R $USER ./
```

#### app/views/layouts/application.html.erb を編集する

`app/views/layouts/application.html.erb`を以下のように編集してください。

```erb
<!DOCTYPE html>
<html>
  <head>
    ... 省略 ...
  </head>

  <body>
    ... 省略 ...

    <div class="container-fluid">
      <div class="row">
        <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
          <div class="position-sticky pt-3">
            <ul class="nav flex-column">
              <li class="nav-item">
                <%= link_to 'トップ', root_path, class: 'nav-link active', 'aria-current': 'page' %>
                <%= link_to 'ユーザー', users_path, class: 'nav-link active', 'aria-current': 'page' %>
              </li>
            </ul>
          </div>
        </nav>

        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <%= yield %>
        </main>
      </div>
    </div>
  </body>
</html>
```

#### link_to と button_to の違いと使い方

Railsでよく使われる `link_to` と `button_to` は、いずれも **ユーザーの操作を受けてアクションを実行するためのヘルパーメソッド** ですが、それぞれに役割や使い方の違いがあります。

##### link_to とは

- HTMLの `<a>` タグを生成するためのRailsヘルパー
- ルーティング(`config/routes.rb`)を元にURLを自動生成
- セキュリティ対策も含まれており、安全にリンクを生成可能

**基本構文**

`link_to` の第1引数にはリンクのテキスト、第2引数にはパスやURLを指定します。第3引数には、ハッシュでmethodオプションや属性を指定することもできます。

```ruby
link_to 'リンクテキスト', パスまたはURL, オプション
```

##### button_to とは

`button_to` はボタンを簡単に作成することができるヘルパーメソッドです。

- HTMLの `<form>` 要素とその中の `<input type="submit">` ボタンを生成
- POSTリクエストなど、GET以外のHTTPメソッドを簡単に使える
- セキュアなフォーム送信を実現したいときに便利

**基本構文**

第1引数にはボタンに表示されるテキストを、第2引数ではボタンをクリックした時に動くアクションを指定するコードを、第3引数にはオプションを指定します。

```ruby
button_to 'ボタンテキスト', パスまたはURL, オプション
```

##### link_to と button_to の違い

| 比較項目 | link_to | button_to |
|---------|---------|-----------|
| 生成されるHTML | `<a>` タグ | `<form>` + `<input type="submit">` |
| デフォルトのHTTPメソッド | GET | POST |

### 挙動を確認する

`/` (ルートページ)にアクセスした後、以下の挙動を1つずつ確認してください。

| ステップ | 操作内容 | 期待される挙動・結果 |
|---------|---------|---------------------|
| 1 | メニューの「ユーザー」をクリックし、`/users` に遷移 | users#index ページが表示される |
| 2 | 「New user」をクリック | users#new ページが表示される |
| 3 | Name, Age を入力して「Create User」をクリック | 「User was successfully created.」と表示され、入力した値が画面に表示される |
| 4 | 「Edit this user」をクリック | users#edit ページが表示される |
| 5 | Name, Age を更新し、「Update User」をクリック | 「User was successfully updated.」と表示され、更新された値が画面に表示される |
| 6 | 「Back to user」をクリック | users#index ページに戻る |
| 7 | 「Show this user」をクリック後、「Destroy this user」をクリック | 「User was successfully destroyed.」と表示され、該当データが一覧から削除されている |

---

## indexアクションの解説(ログの見方含む)

### /users にアクセスした時のログ

メニューのリンク("ユーザー")をクリックすると、ログには以下のような情報が流れます。

```
Started GET "/users" for 192.168.65.1 at 2024-09-11 18:57:43 +0900
Cannot render console from 192.168.65.1! Allowed networks: 127.0.0.0/127.255.255.255, ::1
Processing by UsersController#index as HTML
  Rendering layout layouts/application.html.erb
  Rendering users/index.html.erb within layouts/application
  User Load (0.6ms)  SELECT `users`.* FROM `users`
  ↳ app/views/users/index.html.erb:6
  Rendered users/index.html.erb within layouts/application (Duration: 2.8ms | Allocations: 795)
  Rendered layout layouts/application.html.erb (Duration: 7.4ms | Allocations: 3212)
Completed 200 OK in 9ms (Views: 7.4ms | ActiveRecord: 0.6ms | Allocations: 3470)
```

### ログからわかること

#### Started GET "/users"

- HTTPメソッド: GET、リクエストURL: /users
- この2つの情報をルーティングが受け取ると、ルーティングが`config/routes.rb`に定義されている内容を参照して、どのコントローラーのアクションを動かすかを指示します

`config/routes.rb`に定義されている中身を確認したい場合は、`http://localhost:3000/rails/info/routes` にアクセスすると確認できます。

#### /users → users#index アクションが実行される

今回のHTTPメソッドが `GET` で `/users` へのリクエストに対応するコントローラーとアクションを確認すると、`users#index`(users_controllerのindexアクションの略)であることがわかります。

### コントローラーの処理内容

コントローラー内で定義されたメソッドをアクションと呼びます。

`app/controllers/users_controller.rb`のindexアクションの中身を見ると、右辺で `User.all` を実行したものを左辺の `@users` というインスタンス変数に代入していることが分かります。

```ruby
def index
  @users = User.all
end
```

- `User.all` → データベースの users テーブル全件取得
- その結果を `@users` に代入(ビューで使えるように)

右辺にある `User` は、`app/models/user.rb` に定義されており、`ApplicationRecord` を継承しているため、データベース操作用のメソッドを多数使えます。

```ruby
# 例:使用できる主なメソッド
User.all
User.find(id)
User.where(age: 30)
User.new(params)
User.save
User.update(params)
User.destroy
```

### 対応するビューが呼び出される

1. URLが `/users` のリクエストに対して、`users#index` アクションが呼び出されます
2. これにより、自動的に次のビューが使用されます: `app/views/users/index.html.erb`
3. ビューでは、コントローラーで定義されたインスタンス変数(`@users`)を使ってデータを表示します

6行目にある `@users` が users_controllerのindexアクションから渡された `@users` と同一のものになります。

```ruby
# app/controllers/users_controller.rb
def index
  @users = User.all
end
```

#### ビューでのデータ表示: each + render

ここではUsersテーブルから取得した全てのデータを `each` を使って繰り返し処理を施して1つ1つのデータを取り扱うようにしています。

(`each do` の後ろにある `|xxxx|` の部分が、その繰り返し処理内での変数宣言となっており、`xxxx` と書くことで1つずつデータを扱っています)

```erb
<% @users.each do |user| %>
  <%= render user %>
<% end %>
```

- `@users.each` で、全てのユーザーを1件ずつ取り出します
- 各 `user` に対して `render` を実行
- `render user` は、次のパーシャルを自動的に呼び出します: `app/views/users/_user.html.erb`

##### パーシャルとは

- ファイル名が `_user.html.erb` のように **先頭にアンダースコア(_)** の付いた 再利用可能な部分テンプレート
- `render user` のようにオブジェクトを渡すと、自動的にパーシャルを探して表示してくれます
- `user` の各属性(例:`user.name`, `user.age`)をここで表示します

(renderの使い方やパーシャルに関してはRails基礎で取り扱うので、現状はそうした処理の流れで1つずつのデータの中身を表示させていることを掴んでください)

#### ERBの基本構文

| 書き方 | 処理されるか | 表示されるか | 使いどころ |
|-------|-------------|-------------|-----------|
| `<% ... %>` | 処理される | 表示されない | 繰り返し処理(eachなど) |
| `<%= ... %>` | 処理される | 表示される | 値の表示(name, ageなど) |

```erb
<% @users.each do |user| %>       <%# 繰り返すが表示しない %>
  <%= user.name %>                <%# 表示する %>
<% end %>
```

### ログの確認ポイント

再度ログを確認すると、Processing 以降にどのコントローラーアクションを使って、SQLの発行及びどのビューファイルを使って HTML を作成し、レスポンスのステータスコードを返しているところまでが表示されていることが分かります。

#### ログを読む力はエンジニアにとって重要

エンジニアにとってコードを書くことはもちろん大切ですが、それと同じくらい「ログを読み解く力」も重要です。

##### ログを読む目的

- どんな処理が行われたのか を正確に把握する
- 期待した挙動かどうか を確認する
- エラーやバグの原因 を見つけ出す
- どの処理がどこで行われているか を追跡する

ログを読むことで、目に見えないアプリケーションの内部動作を追いかけることができます。

##### バグ解消のためのログ活用

バグを見つけたときは、以下のような視点でログを活用しましょう。

- どんなリクエストが飛んでいるか
- ルーティングはどのコントローラー/アクションに振り分けているか
- アクションではどんな処理(SQL、メソッドなど)が行われているか
- どのビューファイルが描画されようとしているか
- 期待通りのレスポンスになっているか

ログとコードの両方を見比べることで、原因の特定や問題解決のヒントが得られます。

最初からすべてを理解する必要はありません。

少しずつでも「どこがどう繋がっているのか」を推測する力を鍛えていくことが大切です。

わからないことがあれば、ログやコードを見ながら仮説を立てて検証する姿勢を持ちましょう。

---

## showアクション(コードのみ)

### before_action の動作

users_controllerのshowアクションがルーティングから指示された場合、まずはbefore_actionが指定されたアクションの前に実行されます。

```ruby
before_action :set_user, only: %i[show edit update destroy]
```

これは、以下の4つのアクションの前に `set_user` メソッドが実行されることを意味します。

- show
- edit
- update
- destroy

### set_user メソッドの処理内容

`set_user` のメソッドの中身を見ていくと、左辺の `User.find(params[:id])` でリクエストのURLに含まれる `id` の値を元に Usersテーブルから `id` の値と一致するレコードを1つ取得しています。

その取得したデータを `@user` というインスタンス変数に格納しています。

```ruby
def set_user
  @user = User.find(params[:id])
end
```

### showアクションのビューでの @user の使いどころ

`@user` というインスタンス変数にデータを格納したことによって、users_controllerのshowアクションに対応するビュー(`app/views/users/show.html.erb`)を使ってHTMLを作る際に、そのデータを活用することができます。具体的には以下の3箇所に値を渡しています。

```erb
<%= render @user %>
<%= link_to "Edit this user", edit_user_path(@user) %> |
<%= button_to "Destroy this user", @user, method: :delete %>
```

以下の3箇所で `@user` が使用されています。

| 使用箇所 | 説明 |
|---------|------|
| `<%= render @user %>` | パーシャル `_user.html.erb` を使って `@user` の情報を表示 |
| `<%= link_to "Edit this user", edit_user_path(@user) %>` | 該当ユーザーの編集ページへのリンクを生成 |
| `<%= button_to "Destroy this user", @user, method: :delete %>` | 該当ユーザーを削除するフォームを生成(DELETEメソッド) |

### render @user の仕組み

`render` を使ってオブジェクト(ここでは `@user`)を渡すと、Railsは自動的に次のパーシャルファイルを探して使います。

`app/views/users/_user.html.erb`

このファイル内では、受け取った `user` という変数を用いて次のような表示が行われています。

```erb
<%= user.name %>
<%= user.age %>
```

つまり、コントローラーから渡された `@user` のデータが、パーシャル内で `user` として扱われ、`name` や `age` が表示される仕組みです。

### edit_user_path(@user) の意味と役割

```erb
<%= link_to "Edit this user", edit_user_path(@user) %>
```

このコードの動作を理解するために、`/rails/info/routes`にアクセスした際に表示される表の Helper 列にある `edit_user_path` の行を見てください。

`edit_user_path` というのが、HTTPメソッドのGETで `/users/:id/edit` にアクセスした際に `users_controller` の `edit` アクションが動くことが分かります。

ただし、URLが `/users/:id/edit` となっており、 `:id` に値を渡してあげる必要があることが分かります。

Ruby on Railsでは対照表のHelperに書かれているヘルパーの引数にレコード情報を含むオブジェクトを渡してあげると、自動的に `:id` の部分にオブジェクトに含まれているレコードのIDを渡してくれます。

つまり、`edit_user_path(@user)` と記述することで、引数に渡されたユーザーの編集ページへのURLを作ってくれます。

**例**

```ruby
edit_user_path(@user)
# => "/users/3/edit" (@user.idが3の場合)
```

### button_to と @user の関係

```erb
<%= button_to "Destroy this user", @user, method: :delete %>
```

この記述も、Railsが `@user` の中身(ID)を読み取り、次のように解釈してくれます。

```ruby
user_path(@user)
# => "/users/3" (DELETEメソッド指定)
```

そのため、`@user` を削除するためのボタンとして機能します。

---

## new・createアクション(コードのみ)

users_controller の `new` アクションがルーティングから指示された場合、まずは `before_action` が設定されているかが確認されます。

今回のコードでは、`new` アクションにはフィルターが設定されていないため、素直に `new` アクション内の処理が実行されます。

```ruby
def new
  @user = User.new
end
```

### ビューファイル(new.html.erb)の処理

- `@user` は `new` アクションに対応するビューである `app/views/users/new.html.erb` に渡されます
- その中の以下のコードで使用されています

```erb
<%= render "form", user: @user %>
```

`render` を使用して、`app/views/users/_form.html.erb` パーシャルに `@user` を渡しています。

このように、"form" パーシャルに `user: @user` を渡すことで、バケツリレーのように値が受け渡され、フォームの中で `user` という名前で扱えるようになります。

### _form.html.erb での form_with の使われ方

`_form.html.erb` では、Railsの便利なフォームヘルパーである `form_with` を使用してフォームを作成しています。

```erb
<%= form_with model: user, local: true do |form| %>
  <%= form.text_field :name %>
  <%= form.number_field :age %>
  ...
<% end %>
```

#### form_with の特徴

| 項目 | 内容 |
|-----|------|
| model引数 | モデルのインスタンス(ここでは `user`)を指定 |
| 役割 | 渡されたインスタンスが新規か既存かを判断し、適切なリクエスト(create or update)を自動で生成 |
| メソッド | POST(新規) or PATCH(更新)を適切に選択 |

※ この辺りは Rails基礎で詳しく学びますので、今は「便利にフォームを生成してくれる」という理解で大丈夫です。

### フォーム送信後の流れ(createアクションへ)

1. `/users/new` ページでフォームに入力し、「送信」ボタンを押すと、`form_with` によりリクエストが発行されます
2. このリクエストを元に、Railsは `users_controller` の `create` アクションを実行します

```ruby
def create
  @user = User.new(user_params)

  if @user.save
    redirect_to @user, notice: "User was successfully created."
  else
    render :new
  end
end
```

### Parameter 受け取りとストロングパラメーター

フォームに入力されたものは、Parameter としてコントローラー・アクションに渡されます。

その渡された Parameter の中から必要な値を取り出す際に `params` というメソッドを使います。

ただし送られた値を全て許容してしまうと予期せぬエラーが生じてしまうため、`params` メソッドに加えて、`require`メソッドと`permit`メソッドを使って、 Parameter の中から受け取って良いものだけを指定して取得しています。

Ruby on Rails のこうした許可する値を指定して取得する仕組みをストロングパラメーターと呼びます。(この辺りも詳しくはRails基礎で学習するため、現時点では用語と仕組みを大まかに掴んでください)

```ruby
def user_params
  params.require(:user).permit(:name, :age)
end
```

### データベース登録の成否で処理を分岐

ストロングパラメーターで許可した値を `User.new` に渡しています。

生成されたname, ageに値が入ったインスタンスを、右辺の `@user` に格納しています。

`respond_to` の部分は今時点で理解する必要は無いので省きますが、 `if @user.save` の部分でデータベースへの登録を試みて、成功すれば if 以下の処理を、失敗した場合は else 以下の処理が実行されます。

#### 成功した場合

```ruby
if @user.save
  redirect_to @user, notice: "User was successfully created."
```

- `redirect_to` で 登録されたユーザーの詳細画面(users_controllerのshowアクション)へリダイレクト
- `notice` というキーに"User was successfully created."を渡して、`app/views/users/show.html.erb` の `<%= notice %>` の部分でページ表示

#### 失敗した場合

失敗した際は、`render :new` で `app/views/users/new.html.erb` のビューファイルを呼び出しています。

```ruby
else
  render :new
end
```

---

## edit・updateアクション(コードのみ)

edit・updateアクションですが、new・createアクションで説明したこと、フィルター(`before_action:set_user`)で説明したことを踏まえると、処理の大まかな流れや仕組みは掴めると思うので、ご自身で言語化してみてください。

もし言語化の過程で不安などがあった際は、以下のフローに沿って行動してください。

1. 言語化を試みる
   - 紙に処理の流れを図式化してみる
   - 図式化したものに何を行っているのかの説明書きを加える
2. Google検索を使って、理解に繋がりそうな記事を3~5つ探して精読する
3. 記事を読んで自分が咀嚼して理解したものを踏まえて再度言語化を行う
   - 紙に処理の流れを図式化する
   - 図式化したものに何を行っているのかの説明書きを加える
4. RUNTEQの質問に似たような質問がないか30分以上探す
   - 見つけた質問を元に更に言語化を行う
5. それでも分からない場合は、質問フォームのフォーマットに沿って質問を投稿する

---

## destroyアクション(コードのみ)

### フィルターの実行(before_action :set_user)

まず、`set_user` メソッド(beforeフィルター)が実行され、削除対象のユーザーを取得して `@user` インスタンス変数に格納します。

```ruby
before_action :set_user, only: %i[show edit update destroy]

def set_user
  @user = User.find(params[:id])
end
```

### レコードの削除

```ruby
@user.destroy
```

`@user.destroy` メソッドを呼び出すことで、データベースから該当するユーザーレコードを削除します。

このメソッドは ActiveRecord によって提供されており、関連するコールバック(例:`before_destroy`, `after_destroy`)も実行されます。

### レスポンスの処理(HTMLフォーマットの場合)

- `redirect_to users_url` は、ユーザー一覧ページへリダイレクトします
- `notice: "User was successfully destroyed."` は、フラッシュメッセージを設定します
- これは次のリクエスト時にビューで表示可能です

### レスポンスの処理(JSONフォーマットの場合)

- `head :no_content` は、204 No Contentステータスコードを返します
- これはAPIクライアントに対して、リクエストは成功したが返すコンテンツはないことを伝えます

---

## 文言修正(一部の文言を日本語化)

### ユーザー一覧ページの日本語化

`app/views/users/index.html.erb`を以下のように編集してください。

```erb
<p style="color: green"><%= notice %></p>

<h1>ユーザー一覧</h1>

<div id="users">
  <% @users.each do |user| %>
    <%= render user %>
    <p>
      <%= link_to "Show this user", user %>
    </p>
  <% end %>
</div>

<%= link_to "新規作成", new_user_path %>
```

### ユーザー作成ページ、フォームの日本語化

`app/views/users/new.html.erb`を以下のように編集してください。

```erb
<h1>新規作成</h1>

<%= render "form", user: @user %>

<br>

<div>
  <%= link_to "一覧", users_path %>
</div>
```

`app/views/users/_form.html.erb`を以下のように編集してください。

```erb
<%= form_with(model: user) do |form| %>
  <% if user.errors.any? %>
    <div style="color: red">
      <h2><%= pluralize(user.errors.count, "error") %> prohibited this user from being saved:</h2>

      <ul>
        <% user.errors.each do |error| %>
          <li><%= error.full_message %></li>
        <% end %>
      </ul>
    </div>
  <% end %>

  <div>
    <%= form.label :name, '名前', style: "display: block" %>
    <%= form.text_field :name %>
  </div>

  <div>
    <%= form.label :age, '年齢', style: "display: block" %>
    <%= form.number_field :age %>
  </div>

  <div>
    <%= form.submit '登録' %>
  </div>
<% end %>
```

### ユーザー作成、ユーザー更新、削除後のメッセージの日本語化

`app/controllers/users_controller.rb`を以下のように編集してください。

```ruby
class UsersController < ApplicationController
  before_action :set_user, only: %i[ show edit update destroy ]

  # GET /users or /users.json
  def index
    @users = User.all
  end

  # GET /users/1 or /users/1.json
  def show
  end

  # GET /users/new
  def new
    @user = User.new
  end

  # GET /users/1/edit
  def edit
  end

  # POST /users or /users.json
  def create
    @user = User.new(user_params)

    respond_to do |format|
      if @user.save
        format.html { redirect_to user_url(@user), notice: "ユーザーの新規登録に成功しました" }
        format.json { render :show, status: :created, location: @user }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /users/1 or /users/1.json
  def update
    respond_to do |format|
      if @user.update(user_params)
        format.html { redirect_to user_url(@user), notice: "ユーザーの更新に成功しました" }
        format.json { render :show, status: :ok, location: @user }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /users/1 or /users/1.json
  def destroy
    @user.destroy

    respond_to do |format|
      format.html { redirect_to users_url, notice: "User was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
      @user = User.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def user_params
      params.require(:user).permit(:name, :age)
    end
end
```

### ユーザー編集ページの日本語化

`app/views/users/edit.html.erb`を以下のように編集してください。

```erb
<h1>編集</h1>

<%= render "form", user: @user %>

<br>

<div>
  <%= link_to "詳細", @user %> |
  <%= link_to "一覧", users_path %>
</div>
```

---

## 自動レビュー課題

実装フェーズで実装された内容に加えて、以下の内容が実装できているかを自動レビューにて確認します。

### ユーザー詳細ページの日本語化

| 初期表示 | 変更後表記 |
|---------|-----------|
| Name | 名前 |
| Age | 年齢 |
| Edit this user | 編集 |
| Back to users | 一覧 |
| Destroy this user | 削除 |

※編集するファイルは `app/views/users/show.html.erb` になります。

実装が完了したらプルリクエストを提出して、自動レビューを実施してください。自動レビュー課題では、1文字でも間違っていたり、余計な余白があるとエラーとなるため、正確な値を入力してください。

### 自動レビュー課題の基準

#### ユーザー一覧ページ(GET /users)

- ユーザー一覧ページにアクセスできること
- ページが正常に表示されること
- 各ユーザーの名前が表示されること
- 「名前」というラベルが表示されること
- ページタイトルとして「ユーザー一覧」が表示されること

#### ユーザー詳細ページ(GET /users/{id})

- 特定のユーザーの詳細ページにアクセスできること
- ページが正常に表示されること
- 以下の項目が日本語で表示されること:
  - 「名前」
  - 「年齢」
- 以下のアクションボタンが日本語で表示されること:
  - 「編集」
  - 「一覧」(ユーザー一覧ページへの戻るリンク)
  - 「削除」

#### ユーザー新規作成ページ(GET /users/new)

- ユーザー新規作成ページにアクセスできること
- ページが正常に表示されること
- 以下の入力フィールドが日本語のラベルで表示されること:
  - 「名前」
  - 「年齢」
- 以下のボタンが日本語で表示されること:
  - 「一覧」(ユーザー一覧ページへの戻るリンク)
  - 「登録」(新規ユーザーを作成するためのボタン)

#### ユーザー編集ページ(GET /users/{id}/edit)

- ユーザー編集ページにアクセスできること
- ページが正常に表示されること
- 以下の入力フィールドが日本語のラベルで表示されること:
  - 「名前」
  - 「年齢」
- 以下のボタンが日本語で表示されること:
  - 「一覧」(ユーザー一覧ページへの戻るリンク)
  - 「登録」(更新を確定するためのボタン)

#### ユーザー作成機能(POST /create)

- 適切なパラメーターでリクエストを送信した場合、新しいユーザーが作成されること
- ユーザー作成後、作成されたユーザーの詳細ページにリダイレクトされること
- 作成成功時、「ユーザーの新規登録に成功しました」というフラッシュメッセージが日本語で表示されること

#### ユーザー更新機能(PATCH /update)

- 適切なパラメーターでリクエストを送信した場合、ユーザー情報が更新されること
- 特に、ユーザーの名前が正しく更新されること
- 更新後、更新されたユーザーの詳細ページにリダイレクトされること
- 更新成功時、「ユーザーの更新に成功しました」というフラッシュメッセージが日本語で表示されること

#### ユーザー削除機能(DELETE /destroy)

- ユーザーを削除できること
- 削除操作により、データベース内のユーザー数が1減少すること
- 削除後、ユーザー一覧ページにリダイレクトされること