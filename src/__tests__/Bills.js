import {
  screen
} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {
  bills
} from "../fixtures/bills.js"
import Bill from "../containers/Bills.js"
import firebase from "../__mocks__/firebase"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({
        data: []
      })
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({
        data: bills
      })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  //test click on the new bills button
  describe("When I click on the button to create a new bill", () => {
    test("Then a new bill form should be rendered", () => {
      const html = BillsUI({
        data: bills
      })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        })
      }
      const firestore = null
      const bill = new Bill({
        document,
        onNavigate,
        firestore,
        bills,
        localStorage: window.localStorage
      })

      const handleClickNewBillButton = jest.fn(bill.handleClickNewBillButton)
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', handleClickNewBillButton)
      userEvent.click(newBillButton)
      expect(handleClickNewBillButton).toHaveBeenCalled()

      const newBillForm = screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()

    })
  })

  //test click on the eye button
  describe('When I am on Bills Page and I click on the icon eye', () => {
    test('A modal should open', () => {
      const html = BillsUI({
        data: bills
      })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        })
      }
      const firestore = null
      const bill = new Bill({
        document,
        onNavigate,
        firestore,
        bills,
        localStorage: window.localStorage
      })

      const handleClickIconEye = jest.fn(bill.handleClickIconEye)
      const eye = screen.getByTestId('icon-eye')
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
    })
  })

  //test click on disconnect button

  // ajouter un test d'intégration GET Bills.
  describe("Given I am a user connected as employee", () => {
    describe("When I navigate to Bills", () => {
      test("fetches bills from mock API GET", async () => {
        const getSpy = jest.spyOn(firebase, "get")
        const bills = await firebase.get()
        expect(getSpy).toHaveBeenCalledTimes(1)
        expect(bills.data.length).toBe(4)
      })
      test("fetches bills from an API and fails with 404 message error", async () => {
        firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
        )
        const html = BillsUI({
          error: "Erreur 404"
        })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      test("fetches messages from an API and fails with 500 message error", async () => {
        firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
        )
        const html = BillsUI({
          error: "Erreur 500"
        })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})