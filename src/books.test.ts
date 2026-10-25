import {describe,it,expect} from 'vitest';
import {parseBooks,selectBooks} from './books';
describe('book rules',()=>{
 it('groups the 17/18 boundary and sorts across owners without dropping duplicates',()=>{
 const data=parseBooks([{age:18,books:[{name:'zebra',type:'Ebook'},{name:'Apple',type:'Hardcover'}]},{age:35,books:[{name:'apple',type:'Paperback'}]},{age:17,BOOKS:[{NAME:'Child',type:' Hardcover '}]}]);
 expect(selectBooks(data,'Adults',false).map(b=>b.title)).toEqual(['Apple','apple','zebra']);
 expect(selectBooks(data,'Children',true).map(b=>b.title)).toEqual(['Child']);
 expect(selectBooks(data,'Adults',true).map(b=>b.title)).toEqual(['Apple']);
 });
 it('accepts uppercase sample, empty lists, missing type and preserves source data',()=>{
 const data=parseBooks([{age:10,BOOKS:[{NAME:' Book '}]},{age:20,books:null},{age:22}]);
 expect(data[0].title).toBe('Book');expect(selectBooks(data,'Children',true)).toHaveLength(0);expect(data).toHaveLength(1);
 expect(parseBooks([])).toEqual([]);
 });
 it.each([{},[{age:-1}],[{age:17.5}],[{age:'18'}],[{books:[]}],[{age:20,books:{}}],[{age:20,books:[{name:' '}]}],[{age:20,books:[{name:'Book',type:1}]}]])('rejects malformed payload %j',payload=>{expect(()=>parseBooks(payload)).toThrow();});
});
