import {it,expect,vi} from 'vitest';
import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as api from '../books';
it('loads on demand, filters without refetching, preserves prior results on failure and retries',async()=>{
 const user=userEvent.setup();const fetch=vi.spyOn(api,'fetchBooks').mockResolvedValue(api.parseBooks([{age:18,books:[{name:'Adult story',type:'Paperback'}]},{age:17,books:[{name:'Child story',type:'Hardcover'}]}]));
 render(<App/>);expect(fetch).not.toHaveBeenCalled();
 await user.click(screen.getByRole('button',{name:'Get Books'}));expect(await screen.findByText('Adult story')).toBeInTheDocument();
 await user.click(screen.getByRole('checkbox',{name:'Hardcover only'}));expect(screen.queryByText('Adult story')).not.toBeInTheDocument();expect(screen.getByText('Child story')).toBeInTheDocument();expect(screen.getByRole('heading',{name:'Hardcover Books owned by Adults'})).toBeInTheDocument();expect(fetch).toHaveBeenCalledTimes(1);
 fetch.mockRejectedValueOnce(new Error('offline'));await user.click(screen.getByRole('button',{name:'Get Books'}));expect(await screen.findByRole('alert')).toHaveTextContent('previous collection');expect(screen.getByText('Child story')).toBeInTheDocument();
 await user.click(screen.getByRole('button',{name:'Try again'}));await waitFor(()=>expect(screen.queryByRole('alert')).not.toBeInTheDocument());
});
it('disables fetching during loading and renders empty groups',async()=>{
 let resolve!:(value:api.Book[])=>void;vi.spyOn(api,'fetchBooks').mockImplementation(()=>new Promise(r=>{resolve=r;}));
 render(<App/>);await userEvent.click(screen.getByRole('button',{name:'Get Books'}));expect(screen.getByRole('button',{name:'Getting books…'})).toBeDisabled();resolve([]);expect(await screen.findAllByText('No books match your selection.')).toHaveLength(2);
});
