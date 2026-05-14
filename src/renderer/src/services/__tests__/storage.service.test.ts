import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage
} from '../storage.service'

describe('storage.service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('saveToLocalStorage / loadFromLocalStorage', () => {
    it('round-trips xml and code', () => {
      const xml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="py_say"/></xml>'
      const code = 'print("hello")\n'
      saveToLocalStorage(xml, code)
      expect(loadFromLocalStorage()).toEqual({ xml, code })
    })

    it('returns null when nothing has been saved', () => {
      expect(loadFromLocalStorage()).toBeNull()
    })

    it('returns empty string for code when only xml was stored', () => {
      localStorage.setItem('pyblocks_autosave_xml', '<xml/>')
      expect(loadFromLocalStorage()).toEqual({ xml: '<xml/>', code: '' })
    })

    it('overwrites previous save with new values', () => {
      saveToLocalStorage('<xml>old</xml>', 'old code')
      saveToLocalStorage('<xml>new</xml>', 'new code')
      expect(loadFromLocalStorage()).toEqual({ xml: '<xml>new</xml>', code: 'new code' })
    })
  })

  describe('clearLocalStorage', () => {
    it('removes all autosave data', () => {
      saveToLocalStorage('<xml/>', 'x = 1')
      clearLocalStorage()
      expect(loadFromLocalStorage()).toBeNull()
    })

    it('is safe to call when nothing is saved', () => {
      expect(() => clearLocalStorage()).not.toThrow()
    })
  })
})
