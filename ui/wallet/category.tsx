'use client';

export function Category(props: {categoryId: number}) {

    return (
        <div className="flex items-center rtl:space-x-reverse">
            {props.categoryId === 0 && (
                <div className='w-8 p-1 text-xs rounded-full bg-yellow-200 inline-block text-center font-bold'>未</div>
            )}
            {props.categoryId === 1 && (
                <div className='w-8 p-1 text-xs rounded-full bg-yellow-200 inline-block text-center font-bold'>食</div>
            )}
            {props.categoryId === 2 && (
                <div className='w-8 p-1 text-xs rounded-full bg-yellow-200 inline-block text-center font-bold'>雑</div>
            )}
            {props.categoryId === 3 && (
                <div className='w-8 p-1 text-xs rounded-full bg-yellow-200 inline-block text-center font-bold'>交</div>
            )}
            {props.categoryId === 4 && (
                <div className='w-8 p-1 text-xs rounded-full bg-yellow-200 inline-block text-center font-bold'>他</div>
            )}
        </div>

    )
}
