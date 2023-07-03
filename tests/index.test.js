const url = "http://localhost:3000";

describe("Проверка роутера", () => {
  test("Домашняя страница", async () => {
    const res = await fetch(url);

    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
  });

  test("Каталог", async () => {
    const res = await fetch(`${url}/catalog`);

    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
  });
});

describe("Добавление товара", () => {
    test("Продукт добавлен", async () => {
        const res = await fetch(`${url}/add_cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                "id": 3,
              }),
        });

        expect(res.redirected).toBeTruthy();
        expect(res.url).toBe(`${url}/catalog`);
    });

    test("Некорректный продукт", async () => {
        const res = await fetch(`${url}/add_cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                "id": 999999,
              }),
        });

        expect(res.status).toBe(404);
    });
});
