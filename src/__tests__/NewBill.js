import { fireEvent, screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import firestore from "../app/Firestore.js";
import firebase from "../__mocks__/firebase";

// tests display
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill page should be rendered", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Then a form with nine fields should be rendered", () => {
      document.body.innerHTML = NewBillUI();
      const form = document.querySelector("form");
      expect(form.length).toEqual(9);
    });
  });

  describe("When I am on NewBill Page and I click on disconnect button", () => {
    test("Then, I should be sent to login page", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({ document, onNavigate, localStorage });
      const handleClick = jest.fn(newBill.handleClick);

      const disconnect = screen.getByTestId("layout-disconnect");
      disconnect.addEventListener("click", handleClick);
      userEvent.click(disconnect);
      expect(handleClick).toHaveBeenCalled();
      expect(screen.getByText("Administration")).toBeTruthy();
    });
  });

  // tests form fonction
  describe("When I am on NewBill Page and try to upload valid file", () => {
    test("Then the file should be uploaded", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      window.alert = jest.fn();
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["testTruthy.jpg"], "testTruthy.jpg", {
              type: "image/jpg",
            }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(screen.getByTestId("file").files.length).toEqual(1);
      // expect(window.alert).not.toHaveBeenCalled();
      // expect(fileInput.value).toContain(fileInput.files[0].name);
    });
  });

  describe("When I am on NewBill Page and try to upload invalid file", () => {
    test("Then the file should not be uploaded", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      window.alert = jest.fn();
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["testFalsy.txt"], "testFalsy.txt", { type: "text/txt" }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalled();
      // expect(fileInput.value).not.toContain(fileInput.files[0].name);
    });
  });
});

describe("When I'm on NewBill page and click on submit btn", () => {
  test("Then the form should be submitted", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "johndoe@email.com",
      })
    );

    const containerNewBill = new NewBill({
      document,
      onNavigate,
      firestore: null,
      localStorage: window.localStorage,
    });

    const handleSubmit = jest.spyOn(containerNewBill, "handleSubmit");

    const form = screen.getByTestId("form-new-bill");
    screen.getByTestId("expense-type").value = "Hôtel et logement";
    screen.getByTestId("expense-name").value = "testSubmit";
    screen.getByTestId("datepicker").value = "2022-02-02";
    screen.getByTestId("amount").value = "10";
    screen.getByTestId("vat").value = "10";
    screen.getByTestId("pct").value = "10";
    screen.getByTestId("commentary").value = "testSubmit";
    containerNewBill.fileName = "testSubmit.png";
    containerNewBill.fileUrl = "https://testSubmit.com/testSubmit.png";

    form.addEventListener("submit", handleSubmit);
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalled();
  });
});

// tests  api POST
describe("When I post a new bill", () => {
  test("post bill to mock API POST", async () => {
    const postSpy = jest.spyOn(firebase, "post");
    const newbill = bills[0];
    const bill = await firebase.post(newbill);
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(bill.data.length).toBe(1);
  });

  test("fetches bills from an API and fails with 404 message error", async () => {
    firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 404"))
    );
    const html = BillsUI({ error: "Erreur 404" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });
  test("fetches messages from an API and fails with 500 message error", async () => {
    firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 500"))
    );
    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
