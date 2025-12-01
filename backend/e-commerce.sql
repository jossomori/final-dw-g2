CREATE TABLE users (
    user_id         SERIAL PRIMARY KEY,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    address         VARCHAR(255),
    phone           VARCHAR(20)
);

CREATE TABLE cart (
    cart_id         SERIAL PRIMARY KEY,
    user_id         INT NOT NULL,
    status          VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE category (
    category_id     SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    image           VARCHAR(255)
);

CREATE TABLE product (
    product_id      SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    price           NUMERIC(10,2) NOT NULL,
    stock           INT NOT NULL,
    image           VARCHAR(255),
    category_id     INT REFERENCES category(category_id)
);

CREATE TABLE cart_item (
    item_id         SERIAL PRIMARY KEY,
    cart_id         INT NOT NULL,
    product_id      INT NOT NULL,
    quantity        INT NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE
);

CREATE TABLE order_detail (
    detail_id       SERIAL PRIMARY KEY,
    cart_id         INT NOT NULL,
    payment_method  VARCHAR(50) NOT NULL,
    shipping_type   VARCHAR(50) NOT NULL,
    address         VARCHAR(255) NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id)
);
